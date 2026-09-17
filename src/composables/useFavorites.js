import { store, saveFavoriteMonsters } from '../store.js'
import { isCustomMonster, normalizeMonster, resolveMonsterId } from '../utils/monsterId.js'

/**
 * Adds a monster to favorites. Returns false when it is already present.
 * Matching is done through the canonical monster id so the same monster never
 * ends up in the list twice.
 * @param {object} monster
 * @returns {boolean}
 */
export const addToFavorites = (monster) => {
  if (!monster || !(monster.name || monster.label)) return false

  const favorite = normalizeMonster(monster)
  const id = resolveMonsterId(favorite)

  const alreadyFavorite = store.favoriteMonsters.some((m) => resolveMonsterId(m) === id)
  if (alreadyFavorite) return false

  if (isCustomMonster(monster)) favorite.isCustom = true

  store.favoriteMonsters.push({
    ...favorite,
    addedToFavorites: new Date().toISOString(),
  })
  saveFavoriteMonsters()
  return true
}

/**
 * Removes a single monster from favorites.
 * @param {object} monster
 * @returns {boolean} True when a favorite was removed.
 */
export const removeFromFavorites = (monster) => {
  if (!monster) return false

  const id = resolveMonsterId(monster)
  const index = store.favoriteMonsters.findIndex((m) => resolveMonsterId(m) === id)
  if (index === -1) return false

  store.favoriteMonsters.splice(index, 1)
  saveFavoriteMonsters()
  return true
}

/**
 * Checks whether a monster is already a favorite.
 * @param {object} monster
 * @returns {boolean}
 */
export const isInFavorites = (monster) => {
  if (!monster) return false

  const id = resolveMonsterId(monster)
  return store.favoriteMonsters.some((m) => resolveMonsterId(m) === id)
}

/**
 * Merges imported favorites into the current list, skipping duplicates.
 * @param {object[]} list
 * @returns {number} Amount of newly added favorites.
 */
export const mergeFavoriteMonsters = (list = []) => {
  let added = 0

  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue

    const favorite = normalizeMonster(raw)
    const id = resolveMonsterId(favorite)
    if (store.favoriteMonsters.some((m) => resolveMonsterId(m) === id)) continue

    store.favoriteMonsters.push(favorite)
    added += 1
  }

  if (added > 0) saveFavoriteMonsters()
  return added
}

/**
 * Replaces the entire favorites list with the provided one.
 * @param {object[]} list
 */
export const replaceFavoriteMonsters = (list = []) => {
  const favorites = (Array.isArray(list) ? list : []).map(normalizeMonster)
  store.favoriteMonsters.splice(0, store.favoriteMonsters.length, ...favorites)
  saveFavoriteMonsters()
}

/**
 * Composable exposing the favorite list and its operations.
 * @returns {object}
 */
export const useFavorites = () => ({
  favoriteMonsters: store.favoriteMonsters,
  addToFavorites,
  removeFromFavorites,
  isInFavorites,
  mergeFavoriteMonsters,
  replaceFavoriteMonsters,
})
