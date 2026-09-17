import { computed, reactive, ref, watch } from 'vue'
import { readState, writeState, STORAGE_KEYS } from './usePersistedState.js'

/**
 * UI state shared by the whole app: which panels are visible and the one-time
 * onboarding flags.
 *
 * The persisted part is a local layout preference, so it is intentionally kept
 * out of the exported save file (which only carries favorites and combat data).
 */

const DEFAULT_UI_STATE = {
  showMonsterList: false,
  showFavoriteList: false,
  showCombatEncounter: true,
  hasSeenIntro: false,
}

/** Reads the stored layout, falling back to defaults for missing/invalid values. */
const readUiState = () => {
  const saved = readState(STORAGE_KEYS.uiState, null)
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...DEFAULT_UI_STATE }

  return {
    showMonsterList: Boolean(saved.showMonsterList ?? DEFAULT_UI_STATE.showMonsterList),
    showFavoriteList: Boolean(saved.showFavoriteList ?? DEFAULT_UI_STATE.showFavoriteList),
    showCombatEncounter: Boolean(saved.showCombatEncounter ?? DEFAULT_UI_STATE.showCombatEncounter),
    hasSeenIntro: Boolean(saved.hasSeenIntro ?? DEFAULT_UI_STATE.hasSeenIntro),
  }
}

const uiState = reactive(readUiState())

watch(uiState, (value) => writeState(STORAGE_KEYS.uiState, value), { deep: true })

// Transient: a dialog is not a layout preference, so it is never persisted.
const showAbout = ref(false)

const toggleMonsterList = () => {
  uiState.showMonsterList = !uiState.showMonsterList
}

const toggleFavoriteList = () => {
  uiState.showFavoriteList = !uiState.showFavoriteList
}

const toggleCombatEncounter = () => {
  uiState.showCombatEncounter = !uiState.showCombatEncounter
}

const openMonsterList = () => {
  uiState.showMonsterList = true
}

const openFavoriteList = () => {
  uiState.showFavoriteList = true
}

const openCombatEncounter = () => {
  uiState.showCombatEncounter = true
}

const openAbout = () => {
  showAbout.value = true
}

const closeAbout = () => {
  showAbout.value = false
}

const dismissIntro = () => {
  uiState.hasSeenIntro = true
}

const visibleCount = computed(
  () =>
    [uiState.showCombatEncounter, uiState.showMonsterList, uiState.showFavoriteList].filter(Boolean)
      .length,
)

const hasVisiblePanel = computed(() => visibleCount.value > 0)

/** Layout classes for <main>, based on how many panels are open. */
const mainClass = computed(() => ({
  'single-column': visibleCount.value === 1,
  'two-columns': visibleCount.value === 2,
  'three-columns': visibleCount.value === 3,
}))

/**
 * Composable exposing the shared UI state.
 * @returns {object}
 */
export const useUiState = () => ({
  uiState,
  showAbout,
  visibleCount,
  hasVisiblePanel,
  mainClass,
  toggleMonsterList,
  toggleFavoriteList,
  toggleCombatEncounter,
  openMonsterList,
  openFavoriteList,
  openCombatEncounter,
  openAbout,
  closeAbout,
  dismissIntro,
})
