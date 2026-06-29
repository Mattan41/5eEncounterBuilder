// store.js
import { reactive } from 'vue'
import { getOpen5e } from './api/open5e.js'

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
    // Grundläggande fält
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

  // Identifiera typ av monster
  const isCustomMonster = monster.isCustom || monster.source === 'custom' || !monster.slug

  if (isCustomMonster) {
    console.log('🎨 Detta är ett custom monster')

    // För custom monsters: skapa egen slug och markera som custom
    const customSlug = `custom-${monster.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim()}-${Date.now()}`

    monsterToSave = {
      ...monster,
      slug: customSlug,
      id: customSlug,
      isCustom: true,
      source: 'custom',
      // Säkerställ att vi har grundläggande fält för custom monsters
      type: monster.type || 'Unknown',
      size: monster.size || 'Medium',
      challenge_rating: monster.challenge_rating || monster.challengeRating || 0,
      alignment: monster.alignment || 'Unknown'
    }

    console.log('✅ Custom monster prepared:', monsterToSave)

  } else if (!monster.slug && monster.name) {
    console.log('🔄 API monster saknar slug, hämtar från Open5e...')

    try {
      // Försök hämta från Open5e API
      const data = await getOpen5e('/creatures/', { name__icontains: monster.name, limit: 5 })

      if (data.results && data.results.length > 0) {
        // Försök hitta exakt match
        const exactMatch = data.results.find(m =>
            m.name.toLowerCase() === monster.name.toLowerCase()
        )

        const apiMonster = exactMatch || data.results[0]
        console.log('✅ Hittade i Open5e API:', apiMonster.name)

        monsterToSave = {
          ...apiMonster,
          slug: apiMonster.key,
          source: 'open5e'
        }
      } else {
        console.log('⚠️ Inte i API, behandlar som custom monster')
        // Behandla som custom monster om inte hittas i API
        return addToFavorites({ ...monster, isCustom: true })
      }
    } catch (error) {
      console.error('❌ API search failed, behandlar som custom:', error)
      return addToFavorites({ ...monster, isCustom: true })
    }
  } else {
    console.log('✅ Detta är redan ett komplett API monster')
    monsterToSave.source = 'open5e'
  }

  // Kolla om monstret redan finns (jämför på slug)
  const existingMonster = store.favoriteMonsters.find(m => m.slug === monsterToSave.slug)

  if (!existingMonster) {
    const favoriteMonster = {
      ...monsterToSave,
      addedToFavorites: new Date().toISOString()
    }

    console.log('💾 Sparar i favorites:', favoriteMonster.source, favoriteMonster.name)

    store.favoriteMonsters.push(favoriteMonster)
    saveFavoriteMonsters()
    return true
  } else {
    console.log('ℹ️ Monster finns redan i favorites')
    return false
  }
}

// Helper function to remove a monster from favorites
export const removeFromFavorites = (monster) => {
  let index = -1

  // Försök hitta med slug först
  if (monster.slug) {
    index = store.favoriteMonsters.findIndex(m => m.slug === monster.slug)
  }

  // Fallback till id
  if (index === -1 && monster.id) {
    index = store.favoriteMonsters.findIndex(m => m.id === monster.id)
  }

  // Sista fallback till namn + CR
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

// Helper function för att kolla om monster redan är i favorites
export const isInFavorites = (monster) => {
  const monsterName = monster.name || monster.label
  const monsterSlug = monster.slug
  const monsterCR = monster.challenge_rating || monster.challengeRating

  return store.favoriteMonsters.some(m => {
    // Om båda har slug, använd det
    if (monsterSlug && m.slug) {
      return m.slug === monsterSlug
    }
    // Annars fallback till namn + CR
    const existingName = m.name || m.label
    const existingCR = m.challenge_rating || m.challengeRating
    return existingName === monsterName && existingCR === monsterCR
  })
}

// Ny helper function för att söka monsters från Open5e API
export const searchMonsters = async (searchTerm, page = 1) => {
  if (!searchTerm.trim()) {
    store.monsters = []
    return { results: [], count: 0 }
  }

  try {
    const data = await getOpen5e('/creatures/', { name__icontains: searchTerm, page })

    // Uppdatera store med sökresultat
    if (page === 1) {
      store.monsters = data.results || []
    } else {
      // För paginering, lägg till nya resultat
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

// Helper för att ladda alla monsters (utan sökning)
export const loadAllMonsters = async (page = 1) => {
  try {
    const data = await getOpen5e('/creatures/', { page })

    // Uppdatera store
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
