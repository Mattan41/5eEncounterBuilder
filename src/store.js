import { reactive } from 'vue'

const loadCombatMonsters = () => {
  const savedCombatMonsters = localStorage.getItem('combatMonsters')
  return savedCombatMonsters ? JSON.parse(savedCombatMonsters) : []
}

const loadFavoriteMonsters = () => {
  const savedFavoriteMonsters = localStorage.getItem('favoriteMonsters')
  return savedFavoriteMonsters ? JSON.parse(savedFavoriteMonsters) : []
}

export const store = reactive({
  combatMonsters: loadCombatMonsters(),
  favoriteMonsters: loadFavoriteMonsters()
})

export const saveCombatMonsters = () => {
  localStorage.setItem('combatMonsters', JSON.stringify(store.combatMonsters))
}

export const saveFavoriteMonsters = () => {
  localStorage.setItem('favoriteMonsters', JSON.stringify(store.favoriteMonsters))
}

// Helper function to add a monster to favorites
export const addToFavorites = (monster) => {
  // Kolla om monstret redan finns i favoriter (baserat på namn och CR)
  const existingMonster = store.favoriteMonsters.find(
      m => m.label === monster.label && m.challengeRating === monster.challengeRating
  )

  if (!existingMonster) {
    const favoriteMonster = {
      ...monster,
      id: `fav_${Date.now()}`,
      addedToFavorites: new Date().toISOString()
    }
    store.favoriteMonsters.push(favoriteMonster)
    saveFavoriteMonsters()
    return true // indikates the monster was added successfully
  }
  return false // The monster was already in favorites
}

// Helper function to remove a monster from favorites
export const removeFromFavorites = (monster) => {
  const index = store.favoriteMonsters.findIndex(m => m.id === monster.id)
  if (index !== -1) {
    store.favoriteMonsters.splice(index, 1)
    saveFavoriteMonsters()
  }
}
