import { ref } from 'vue'
import { store, saveCombatMonsters, saveCombatSession } from '../store.js'
import { mergeFavoriteMonsters, replaceFavoriteMonsters } from './useFavorites.js'
import { normalizeCombatMonster } from '../utils/monsterId.js'
import { DEFAULT_COMBAT_SESSION, normalizeCombatSession } from '../utils/combatSession.js'

/**
 * Current save-file schema version. Bump this when the exported shape changes
 * and add a matching entry to `migrations` so older files keep working.
 *
 * v1 -> v2: added combat session fields (currentRound, currentMonsterIndex,
 * isCombatActive, hasCombatStarted).
 */
export const CURRENT_STATE_VERSION = 2

/**
 * Migration functions keyed by the version they upgrade *from*.
 * Each migration receives the parsed state and returns the migrated state.
 */
export const migrations = {
  // v1 files have no combat session data; default to a fresh, not-started fight.
  1: (state) => ({ ...state, ...DEFAULT_COMBAT_SESSION }),
}

/** Converts the reactive store into a plain, serializable snapshot object. */
export const buildSnapshot = () => ({
  version: CURRENT_STATE_VERSION,
  exportedAt: new Date().toISOString(),
  favoriteMonsters: JSON.parse(JSON.stringify(store.favoriteMonsters)),
  combatMonsters: JSON.parse(JSON.stringify(store.combatMonsters)),
  currentRound: store.combatSession.currentRound,
  currentMonsterIndex: store.combatSession.currentMonsterIndex,
  isCombatActive: store.combatSession.isCombatActive,
  hasCombatStarted: store.combatSession.hasCombatStarted,
})

/** Serializes the current app state for download. */
export const serializeState = () => JSON.stringify(buildSnapshot(), null, 2)

/**
 * Validates an imported save file and migrates it to the current version.
 * Throws a descriptive Error when the file cannot be used.
 * @param {*} raw Parsed JSON value.
 * @returns {object} Validated, migrated state.
 */
export const validateImportedState = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid save file: expected a JSON object.')
  }

  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version)) {
    throw new Error('Invalid save file: missing or invalid "version" field.')
  }

  if (raw.version > CURRENT_STATE_VERSION) {
    throw new Error(
      `Unsupported save file version ${raw.version}. This app supports up to version ${CURRENT_STATE_VERSION}.`,
    )
  }

  if (raw.version < 1) {
    throw new Error(`Unsupported save file version ${raw.version}.`)
  }

  if (!Array.isArray(raw.favoriteMonsters) || !Array.isArray(raw.combatMonsters)) {
    throw new Error(
      'Invalid save file: "favoriteMonsters" and "combatMonsters" must both be arrays.',
    )
  }

  let state = raw
  for (let version = state.version; version < CURRENT_STATE_VERSION; version++) {
    const migrate = migrations[version]
    state = migrate ? migrate(state) : state
    state = { ...state, version: version + 1 }
  }

  return state
}

/**
 * Applies a validated state to the store and persists it.
 * @param {object} state
 * @param {'replace'|'merge'} mode
 */
const applyStateSnapshot = (state, mode) => {
  if (mode === 'replace') {
    replaceFavoriteMonsters(state.favoriteMonsters)
    const combat = state.combatMonsters.map((monster) => normalizeCombatMonster(monster))
    store.combatMonsters.splice(0, store.combatMonsters.length, ...combat)
  } else {
    mergeFavoriteMonsters(state.favoriteMonsters)
    // Fresh combatIds so imported entries never collide with this session.
    const combat = state.combatMonsters.map((monster) =>
      normalizeCombatMonster({ ...monster, combatId: undefined }),
    )
    store.combatMonsters.push(...combat)
  }

  // Restore the round/turn/started flags, clamped against the resulting list so
  // a stale index can never point outside combatMonsters.
  Object.assign(store.combatSession, normalizeCombatSession(state, store.combatMonsters.length))

  saveCombatMonsters()
  saveCombatSession()
}

const importError = ref('')
const importMessage = ref('')
const pendingState = ref(null)

/**
 * Composable handling full app-state export/import.
 * @returns {object}
 */
export const useAppState = () => {
  const exportState = () => {
    const blob = new Blob([serializeState()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `encounterbuilder-state-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Reads and validates a selected file. Returns true when it can be imported.
   * @param {File} file
   * @returns {Promise<boolean>}
   */
  const readImportFile = async (file) => {
    importError.value = ''
    importMessage.value = ''
    pendingState.value = null

    try {
      const parsed = JSON.parse(await file.text())
      pendingState.value = validateImportedState(parsed)
      return true
    } catch (err) {
      importError.value =
        err instanceof SyntaxError
          ? 'Invalid save file: the file is not valid JSON.'
          : err.message || 'Could not read the selected file.'
      return false
    }
  }

  /**
   * Applies the pending file to the current state.
   * @param {'replace'|'merge'} mode
   */
  const applyImportedState = (mode) => {
    if (!pendingState.value) {
      importError.value = 'No save file selected.'
      return
    }

    try {
      applyStateSnapshot(pendingState.value, mode)
      importMessage.value =
        mode === 'replace'
          ? 'State replaced from save file.'
          : 'Save file merged into the current state.'
      importError.value = ''
      pendingState.value = null
    } catch (err) {
      importError.value = err.message || 'Failed to import the save file.'
    }
  }

  return {
    exportState,
    readImportFile,
    applyImportedState,
    importError,
    importMessage,
    pendingState,
  }
}
