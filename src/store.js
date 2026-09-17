// store.js
import { reactive } from 'vue'
import { readState, writeState, STORAGE_KEYS } from './composables/usePersistedState.js'
import { normalizeCombatMonster, normalizeMonster } from './utils/monsterId.js'

export { formatCR, crToDecimal } from './utils/formatCR.js'

const loadCombatMonsters = () => {
  const saved = readState(STORAGE_KEYS.combatMonsters, [])
  return Array.isArray(saved) ? saved.map(normalizeCombatMonster) : []
}

const loadFavoriteMonsters = () => {
  const saved = readState(STORAGE_KEYS.favoriteMonsters, [])
  return Array.isArray(saved) ? saved.map(normalizeMonster) : []
}

export const store = reactive({
  combatMonsters: loadCombatMonsters(),
  favoriteMonsters: loadFavoriteMonsters(),
})

export const saveCombatMonsters = () => {
  writeState(STORAGE_KEYS.combatMonsters, store.combatMonsters)
}

export const saveFavoriteMonsters = () => {
  writeState(STORAGE_KEYS.favoriteMonsters, store.favoriteMonsters)
}
