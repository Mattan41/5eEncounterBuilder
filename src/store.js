// store.js
import { reactive } from 'vue'
import { getOpen5e } from './api/open5e.js'

export const formatCR = (cr) => {
  const n = parseFloat(cr) || 0;
  if (n === 0.125) return '1/8';
  if (n === 0.25) return '1/4';
  if (n === 0.5) return '1/2';

  // Remove unnecessary decimals (e.g., 1.0 become 1)
  return n.toString();
}

const loadCombatMonsters = () => {
  const savedCombatMonsters = localStorage.getItem('combatMonsters')
  return savedCombatMonsters ? JSON.parse(savedCombatMonsters) : []
}

const loadFavoriteMonsters = () => {
  const savedFavoriteMonsters = localStorage.getItem('favoriteMonsters')
  return savedFavoriteMonsters ? JSON.parse(savedFavoriteMonsters) : []
}

export const store = reactive({
  monsters: [],
  combatMonsters: loadCombatMonsters(),
  favoriteMonsters: loadFavoriteMonsters(),
  searchTerm: ''
})

export const saveCombatMonsters = () => {
  localStorage.setItem('combatMonsters', JSON.stringify(store.combatMonsters))
}

export const saveFavoriteMonsters = () => {
  localStorage.setItem('favoriteMonsters', JSON.stringify(store.favoriteMonsters))
}

export const createCustomMonster = (monsterData) => {
  const customMonster = {
    // Basic fields
    name: monsterData.name,
    type: monsterData.type || 'Humanoid',
    size: monsterData.size || 'Medium',
    alignment: monsterData.alignment || 'Neutral',

    // Combat stats
    armor_class: monsterData.armor_class || 10,
    hit_points: monsterData.hit_points || 10,
    challenge_rating: monsterData.challenge_rating || 0,

    // Abilities
    strength: monsterData.strength || 10,
    dexterity: monsterData.dexterity || 10,
    constitution: monsterData.constitution || 10,
    intelligence: monsterData.intelligence || 10,
    wisdom: monsterData.wisdom || 10,
    charisma: monsterData.charisma || 10,

    // Custom fields
    desc: monsterData.description || '',
    actions: monsterData.actions || [],
    special_abilities: monsterData.special_abilities || [],

    // Metadata
    isCustom: true,
    source: 'custom',
    createdAt: new Date().toISOString()
  }

  return addToFavorites(customMonster)
}

export const addToFavorites = async (monster) => {
  console.log('🔍 addToFavorites called with:', monster)

  let monsterToSave = { ...monster }

  // Identify monster type
  const isCustomMonster = monster.isCustom || monster.source === 'custom' || (!monster.slug && !monster.key)

  if (isCustomMonster) {
    console.log('🎨 This is a custom monster')

    // For custom monsters: create a name-based slug and mark as custom
    const customSlug = `custom-${monster.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim()}`

    // Prevent duplicates: check by name-based slug (no timestamp)
    const existingCustom = store.favoriteMonsters.find(m => m.slug === customSlug)
    if (existingCustom) {
      console.log('ℹ️ Custom monster already in favorites')
      return false
    }

    monsterToSave = {
      ...monster,
      slug: customSlug,
      id: customSlug,
      isCustom: true,
      source: 'custom',
      // Ensure basic fields are present for custom monsters
      type: monster.type || 'Unknown',
      size: monster.size || 'Medium',
      challenge_rating: monster.challenge_rating || monster.challengeRating || 0,
      challenge_rating_display: formatCR(monster.challenge_rating || monster.challengeRating),
      alignment: monster.alignment || 'Unknown'
    }

    console.log('✅ Custom monster prepared:', monsterToSave)

  } else {
    console.log('✅ This is an API monster')
    monsterToSave.source = 'open5e'
    // Ensure slug is set for API monsters (v2 uses key)
    if (!monsterToSave.slug && monsterToSave.key) {
      monsterToSave.slug = monsterToSave.key
    }
  }

  // Check if monster already exists (compare by slug or key)
  const existingMonster = store.favoriteMonsters.find(m =>
    (monsterToSave.slug && m.slug === monsterToSave.slug) ||
    (monsterToSave.key && m.key === monsterToSave.key)
  )

  if (!existingMonster) {
    const favoriteMonster = {
      ...monsterToSave,
      addedToFavorites: new Date().toISOString()
    }

    console.log('💾 Saving to favorites:', favoriteMonster.source, favoriteMonster.name)

    store.favoriteMonsters.push(favoriteMonster)
    saveFavoriteMonsters()
    return true
  } else {
    console.log('ℹ️ Monster already in favorites')
    return false
  }
}

// Helper function to remove a monster from favorites
export const removeFromFavorites = (monster) => {
  let index = -1

  // Try slug first
  if (monster.slug) {
    index = store.favoriteMonsters.findIndex(m => m.slug === monster.slug)
  }

  // Fallback to id
  if (index === -1 && monster.id) {
    index = store.favoriteMonsters.findIndex(m => m.id === monster.id)
  }

  // Final fallback to name + CR
  if (index === -1) {
    const monsterName = monster.name || monster.label
    const monsterCR = monster.challenge_rating || monster.challengeRating
    index = store.favoriteMonsters.findIndex(m => {
      const existingName = m.name || m.label
      const existingCR = m.challenge_rating || m.challengeRating
      return existingName === monsterName && existingCR === monsterCR
    })
  }

  if (index !== -1) {
    store.favoriteMonsters.splice(index, 1)
    saveFavoriteMonsters()
  }
}

// Helper function to check if a monster is already in favorites
export const isInFavorites = (monster) => {
  const monsterName = monster.name || monster.label
  const monsterSlug = monster.slug || monster.key
  const monsterCR = monster.challenge_rating || monster.challengeRating

  return store.favoriteMonsters.some(m => {
    // If both have a slug/key, use that
    if (monsterSlug && (m.slug || m.key)) {
      return m.slug === monsterSlug || m.key === monsterSlug
    }
    // Fallback to name + CR
    const existingName = m.name || m.label
    const existingCR = m.challenge_rating || m.challengeRating
    return existingName === monsterName && existingCR === monsterCR
  })
}

// Helper function to search monsters from Open5e API
export const searchMonsters = async (searchTerm, page = 1) => {
  if (!searchTerm.trim()) {
    store.monsters = []
    return { results: [], count: 0 }
  }

  try {
    const data = await getOpen5e('/creatures/', { name__icontains: searchTerm, page })

    // Update store with search results
    if (page === 1) {
      store.monsters = data.results || []
    } else {
      // For pagination, append new results
      store.monsters = [...store.monsters, ...(data.results || [])]
    }

    return data
  } catch (error) {
    console.error('Error searching monsters:', error)
    if (page === 1) {
      store.monsters = []
    }
    return { results: [], count: 0, error: error.message }
  }
}

// Helper function to load all monsters (without search)
export const loadAllMonsters = async (page = 1) => {
  try {
    const data = await getOpen5e('/creatures/', { page })

    // Update store
    if (page === 1) {
      store.monsters = data.results || []
    } else {
      store.monsters = [...store.monsters, ...(data.results || [])]
    }

    return data
  } catch (error) {
    console.error('Error loading monsters:', error)
    if (page === 1) {
      store.monsters = []
    }
    return { results: [], count: 0, error: error.message }
  }
}
