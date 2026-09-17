// store.js
import { reactive } from 'vue'
import { readState, writeState, STORAGE_KEYS } from './composables/usePersistedState.js'
import { normalizeCombatMonster, normalizeMonster } from './utils/monsterId.js'
import { normalizeCombatSession } from './utils/combatSession.js'

export { formatCR, crToDecimal } from './utils/formatCR.js'

const loadCombatMonsters = () => {
  const saved = readState(STORAGE_KEYS.combatMonsters, [])
  return Array.isArray(saved) ? saved.map(normalizeCombatMonster) : []
}

const loadFavoriteMonsters = () => {
  const saved = readState(STORAGE_KEYS.favoriteMonsters, [])
  return Array.isArray(saved) ? saved.map(normalizeMonster) : []
}

const combatMonsters = loadCombatMonsters()

export const store = reactive({
  combatMonsters,
  favoriteMonsters: loadFavoriteMonsters(),
  // Round/turn/started flags for the active fight. The index is clamped against
  // the restored monster list so a removed monster can't leave it out of range.
  combatSession: normalizeCombatSession(
    readState(STORAGE_KEYS.combatSession, null),
    combatMonsters.length,
  ),
})

export const saveCombatMonsters = () => {
  writeState(STORAGE_KEYS.combatMonsters, store.combatMonsters)
}

export const saveFavoriteMonsters = () => {
  writeState(STORAGE_KEYS.favoriteMonsters, store.favoriteMonsters)
}

export const saveCombatSession = () => {
  writeState(STORAGE_KEYS.combatSession, store.combatSession)
}
