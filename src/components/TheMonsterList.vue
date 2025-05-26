<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { saveCombatMonsters, store, addToFavorites } from '../store.js'
import MonsterSearch from "@/components/MonsterSearch.vue"

const monsters = ref([])
const header = ref('Monster List')
const editing = ref(false)

// Search & filter states
const searchQuery = ref('')
const showAdvancedSearch = ref(false)
const selectedCR = ref('')
const selectedCRMax = ref('')
const selectedType = ref('')
const selectedDocument = ref('')

// Sorting states
const sortBy = ref('name')
const sortOrder = ref('asc')

// Add monster states
const newMonster = ref("")
const newMonsterHP = ref(0)
const newMonsterCR = ref("0")
const newMonsterInCombat = ref(false)

// Pagination states
const totalResults = ref(0)
const currentPage = ref(1)
const isLoading = ref(false)
const hasMoreResults = ref(false)
const resultsPerPage = 10

const searchMonsters = async (resetResults = true) => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    if (resetResults) {
      monsters.value = []
      currentPage.value = 1
    }

    const offset = (currentPage.value - 1) * resultsPerPage

    // Bygg query string
    let queryParams = new URLSearchParams({
      search: searchQuery.value,
      limit: resultsPerPage,
      offset: offset,
      ordering: sortOrder.value === 'desc' ? `-${sortBy.value}` : sortBy.value
    })

    // Lägg till filter
    if (selectedCR.value) {
      queryParams.append('challenge_rating__gte', selectedCR.value)
    }
    if (selectedCRMax.value) {
      queryParams.append('challenge_rating__lte', selectedCRMax.value)
    }
    if (selectedType.value) {
      queryParams.append('type', selectedType.value)
    }
    if (selectedDocument.value) {
      queryParams.append('document__slug', selectedDocument.value)  // Viktigt: document__slug
    }

    const response = await fetch(`https://api.open5e.com/monsters/?${queryParams}`)
    const data = await response.json()

    totalResults.value = data.count
    hasMoreResults.value = data.next !== null

    const newMonsters = data.results.map((monster, index) => ({
      id: `api_${offset + index}`,
      label: monster.name,
      challengeRating: parseFloat(monster.challenge_rating),
      hitPoints: monster.hit_points,
      originalHitPoints: monster.hit_points,
      type: monster.type,
      size: monster.size,
      armorClass: monster.armor_class,
      document: monster.document__title || 'Unknown'
    }))

    if (resetResults) {
      monsters.value = newMonsters
    } else {
      monsters.value.push(...newMonsters)
    }

  } catch (error) {
    console.log('Error fetching monsters', error)
  } finally {
    isLoading.value = false
  }
}

// Sortering
const sortMonsters = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  searchMonsters(true)
}

const getSortIcon = (field) => {
  if (sortBy.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

const getSortClass = (field) => {
  return sortBy.value === field ? 'sorted' : ''
}

// Resten av dina befintliga funktioner...
const loadMoreResults = async () => {
  if (!hasMoreResults.value || isLoading.value) return
  currentPage.value++
  await searchMonsters(false)
}

const handleScroll = () => {
  const scrollContainer = document.querySelector('.monsters-scroll-container')
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const threshold = 100

  if (scrollHeight - scrollTop - clientHeight < threshold && hasMoreResults.value && !isLoading.value) {
    loadMoreResults()
  }
}

const saveMonster = () => {
  const monster = {
    id: `custom_${Date.now()}`,
    label: newMonster.value,
    challengeRating: parseFloat(newMonsterCR.value),
    hitPoints: newMonsterHP.value,
    originalHitPoints: newMonsterHP.value,
    type: 'custom',
    size: 'Medium',
    armorClass: 10
  }

  addToFavorites(monster)

  if (newMonsterInCombat.value) {
    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
    saveCombatMonsters()
  }

  newMonster.value = ""
  newMonsterHP.value = 0
  newMonsterCR.value = "0"
  newMonsterInCombat.value = false
}

const addToCombatList = (monster, event) => {
  event.preventDefault()
  if (event.type === 'click') {
    const addedToFavorites = addToFavorites(monster)

    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
    saveCombatMonsters()

    const listItem = event.currentTarget
    listItem.classList.add('blink')
    setTimeout(() => {
      listItem.classList.remove('blink')
    }, 1000)

    if (addedToFavorites) {
      console.log(`${monster.label} added to favorites and combat!`)
    }
  }
}

const addToFavoritesOnly = (monster, event) => {
  event.preventDefault()
  event.stopPropagation()

  const added = addToFavorites(monster)
  if (added) {
    const button = event.currentTarget
    button.textContent = '★'
    button.style.color = '#ff9100'
    setTimeout(() => {
      button.textContent = '☆'
      button.style.color = ''
    }, 1000)
  }
}

const doEdit = (e) => {
  editing.value = e
  newMonster.value = ""
  newMonsterHP.value = 0
  newMonsterCR.value = "0"
  newMonsterInCombat.value = false
}

onMounted(() => {
  const scrollContainer = document.querySelector('.monsters-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const scrollContainer = document.querySelector('.monsters-scroll-container')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="monster-container container">
    <div class="header">
      <h1>{{ header }}</h1>
      <button v-if="!editing" @click="doEdit(true)">Add Monster</button>
      <button v-else @click="doEdit(false)">Cancel</button>
    </div>

    <!-- MonsterSearch komponenten -->
    <MonsterSearch
        v-model:search-query="searchQuery"
        v-model:selected-c-r="selectedCR"
        v-model:selected-c-r-max="selectedCRMax"
        v-model:selected-type="selectedType"
        v-model:selected-document="selectedDocument"
        v-model:show-advanced-search="showAdvancedSearch"
        :is-loading="isLoading"
        :total-results="totalResults"
        @search="searchMonsters(true)"
    />

    <!-- Add Monster Form -->
    <form class="add-monsters-form" v-if="editing" @submit.prevent="saveMonster">
      <input v-model.trim="newMonster" type="text" placeholder="Monster Name">
      <input v-model.number="newMonsterHP" type="number" placeholder="Hit Points">
      <input v-model.number="newMonsterCR" type="number" step="any" placeholder="Challenge Rating">
      <label for="newMonster">
        <input v-model="newMonsterInCombat" type="checkbox"> Add to Combat
      </label>
      <button :disabled="newMonster.length < 1 || newMonsterHP <= 0 || !newMonsterCR" class="btn btn-primary">
        Save
      </button>
    </form>

    <!-- Klickbar Monster List Header med sortering -->
    <div class="monster-list-header">
      <span @click="sortMonsters('name')" :class="getSortClass('name')" class="sortable">
        Name {{ getSortIcon('name') }}
      </span>
      <span @click="sortMonsters('type')" :class="getSortClass('type')" class="sortable">
        Type {{ getSortIcon('type') }}
      </span>
      <span @click="sortMonsters('challenge_rating')" :class="getSortClass('challenge_rating')" class="sortable">
        CR {{ getSortIcon('challenge_rating') }}
      </span>
      <span @click="sortMonsters('hit_points')" :class="getSortClass('hit_points')" class="sortable">
        HP {{ getSortIcon('hit_points') }}
      </span>
      <span @click="sortMonsters('armor_class')" :class="getSortClass('armor_class')" class="sortable">
        AC {{ getSortIcon('armor_class') }}
      </span>
      <span>Fav</span>
    </div>

    <!-- Monster List -->
    <div class="monsters-scroll-container">
      <ul>
        <li v-for="monster in monsters" @click="addToCombatList(monster, $event)" :key="monster.id">
          <span class="monster-name">{{ monster.label }}</span>
          <span class="monster-type">{{ monster.type }}</span>
          <span class="monster-cr">{{ monster.challengeRating }}</span>
          <span class="monster-hp">{{ monster.hitPoints }}</span>
          <span class="monster-ac">{{ monster.armorClass || '-' }}</span>
          <span class="monster-fav">
            <button
                @click="addToFavoritesOnly(monster, $event)"
                class="favorite-btn"
                title="Add to favorites">
              ☆
            </button>
          </span>
        </li>
      </ul>

      <!-- Loading indikator -->
      <div v-if="isLoading" class="loading-indicator">
        <p>Loading more monsters...</p>
      </div>

      <!-- Meddelande när alla resultat är laddade -->
      <div v-if="!hasMoreResults && monsters.length > 0 && totalResults > resultsPerPage" class="end-of-results">
        <p>All results loaded</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Monster list header med sortering */
.monster-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.7fr 0.5fr;
  gap: 0.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.monster-list-header span {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 3px;
}

.monster-list-header span.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.monster-list-header span.sorted {
  background-color: rgba(74, 144, 226, 0.3);
  color: #fff;
}

/* Monster list items */
li {
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.7fr 0.5fr;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

li:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.monster-name {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.monster-type,
.monster-cr,
.monster-hp,
.monster-ac {
  text-align: center;
  color: #ccc;
}

.monster-fav {
  text-align: center;
}

/* Add monster form */
.add-monsters-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Scroll container */
.monsters-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
}

.monsters-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.monsters-scroll-container::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.monsters-scroll-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.monsters-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Loading och end states */
.loading-indicator,
.end-of-results {
  text-align: center;
  padding: 1rem;
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}

.loading-indicator p,
.end-of-results p {
  margin: 0;
}

/* Favorite button */
.favorite-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ccc;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  color: #ff9100;
  background-color: rgba(255, 145, 0, 0.1);
}

/* Responsiv design */
@media (max-width: 767px) {
  .monster-list-header {
    grid-template-columns: 2fr 1fr 0.6fr 0.6fr 0.6fr 0.4fr;
    font-size: 0.9rem;
  }

  li {
    grid-template-columns: 2fr 1fr 0.6fr 0.6fr 0.6fr 0.4fr;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .monster-list-header {
    grid-template-columns: 2fr 1fr 0.5fr 0.5fr 0.4fr;
  }

  li {
    grid-template-columns: 2fr 1fr 0.5fr 0.5fr 0.4fr;
  }

  /* Dölj AC på små skärmar */
  .monster-list-header span:nth-child(5),
  li .monster-ac {
    display: none;
  }
}
</style>
