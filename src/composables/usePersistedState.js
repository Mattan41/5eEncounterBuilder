/**
 * Single place responsible for reading/writing persisted application state.
 * Every localStorage access in the app goes through this module.
 */

export const STORAGE_KEYS = {
  combatMonsters: 'combatMonsters',
  favoriteMonsters: 'favoriteMonsters',
  combatSession: 'combatSession',
  // Local layout preference (which panels are open + one-time onboarding flags).
  // Deliberately not part of the exported save file.
  uiState: 'uiState',
}

const hasStorage = () => typeof localStorage !== 'undefined'

/**
 * Reads and parses a JSON value from localStorage.
 * @param {string} key
 * @param {*} fallback Value returned when the key is missing or unreadable.
 * @returns {*}
 */
export const readState = (key, fallback) => {
  if (!hasStorage()) return fallback

  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null ? fallback : parsed
  } catch (error) {
    console.error(`Failed to read "${key}" from localStorage`, error)
    return fallback
  }
}

/**
 * Serializes and writes a value to localStorage.
 * @param {string} key
 * @param {*} value
 * @returns {boolean} True when the value was persisted.
 */
export const writeState = (key, value) => {
  if (!hasStorage()) return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to write "${key}" to localStorage`, error)
    return false
  }
}
