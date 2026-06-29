<script setup>
import {onMounted, ref, computed} from 'vue'
import {addToFavorites, saveCombatMonsters, store} from '../store.js'
import MonsterSearch from "@/components/MonsterSearch.vue"
import AddMonsterModal from "@/modals/AddMonsterModal.vue"
import { getOpen5e } from '../api/open5e.js'

const monsters = ref([])
const header = ref('Monster List')
const showAddModal = ref(false)

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

// Loading state
const isLoading = ref(false)
const totalResults = ref(0)

// Convert fraction CR strings (e.g. "1/4") to decimal strings for the API
const crToDecimal = (cr) => {
  if (cr === '1/8') return '0.125'
  if (cr === '1/4') return '0.25'
  if (cr === '1/2') return '0.5'
  return cr
}

const searchMonsters = async (resetResults = true) => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    if (resetResults) {
      monsters.value = []
    }

    // Build query params
    const params = { limit: 1000 }

    // Add search query and filters
    if (searchQuery.value)      params.name__icontains = searchQuery.value
    if (selectedCR.value)       params.challenge_rating__gte = crToDecimal(selectedCR.value)
    if (selectedCRMax.value)    params.challenge_rating__lte = crToDecimal(selectedCRMax.value)
    if (selectedDocument.value) params.document__key__in = selectedDocument.value

    const data = await getOpen5e('/creatures/', params)

    totalResults.value = data.count
    monsters.value = data.results.map((monster) => ({
      ...monster,
      id: `api_${monster.key}`,
      slug: monster.key,
      label: monster.name,
      type: typeof monster.type === 'object' ? (monster.type?.name || '') : monster.type,
      challengeRating: parseFloat(monster.challenge_rating || 0),
      hitPoints: monster.hit_points,
      armorClass: monster.armor_class,
      source: 'open5e'
    }))

  } catch (error) {
    console.log('Error fetching monsters', error)
  } finally {
    isLoading.value = false
  }
}
// Client-side type filter + sort — no re-fetch needed when sorting or filtering by type
const displayMonsters = computed(() => {
  let result = monsters.value

  // Type filter (API type__key filter is unreliable, do it client-side)
  if (selectedType.value) {
    const typeLower = selectedType.value.toLowerCase()
    result = result.filter(m => (m.type || '').toLowerCase() === typeLower)
  }

  // Sort
  return [...result].sort((a, b) => {
    let valA = a[sortBy.value]
    let valB = b[sortBy.value]

    if (sortBy.value === 'challengeRating' || sortBy.value === 'hitPoints' || sortBy.value === 'armorClass') {
      valA = parseFloat(valA) || 0
      valB = parseFloat(valB) || 0
    } else {
      valA = (valA ?? '').toString().toLowerCase()
      valB = (valB ?? '').toString().toLowerCase()
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

// Sorting
const sortMonsters = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  // No re-fetch — displayMonsters computed reacts automatically
}

const getSortIcon = (field) => {
  if (sortBy.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

const getSortClass = (field) => {
  return sortBy.value === field ? 'sorted' : ''
}

// Monster actions
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

// Lifecycle hooks
onMounted(() => {
})

</script>


<template>
  <div class="monster-container container">
    <div class="header">
      <h1>{{ header }}</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        + Add Monster
      </button>
    </div>

    <MonsterSearch
        v-model:search-query="searchQuery"
        v-model:selected-c-r="selectedCR"
        v-model:selected-c-r-max="selectedCRMax"
        v-model:selected-type="selectedType"
        v-model:selected-document="selectedDocument"
        v-model:show-advanced-search="showAdvancedSearch"
        :is-loading="isLoading"
        @search="searchMonsters(true)"
    />

    <div class="monster-list-header">
      <span @click="sortMonsters('name')" :class="getSortClass('name')" class="sortable">
        Name {{ getSortIcon('name') }}
      </span>
      <span @click="sortMonsters('type')" :class="getSortClass('type')" class="sortable">
        Type {{ getSortIcon('type') }}
      </span>
      <span @click="sortMonsters('challengeRating')" :class="getSortClass('challengeRating')" class="sortable">
        CR {{ getSortIcon('challengeRating') }}
      </span>
      <span @click="sortMonsters('hitPoints')" :class="getSortClass('hitPoints')" class="sortable">
        HP {{ getSortIcon('hitPoints') }}
      </span>
      <span @click="sortMonsters('armorClass')" :class="getSortClass('armorClass')" class="sortable">
        AC {{ getSortIcon('armorClass') }}
      </span>
      <span>Fav</span>
    </div>

    <p v-if="displayMonsters.length > 0">Found {{ displayMonsters.length }} monsters</p>

    <div class="monsters-scroll-container">
      <ul>
        <li v-for="monster in displayMonsters" @click="addToCombatList(monster, $event)" :key="monster.id">
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

      <div v-if="isLoading" class="loading-indicator">
        <p>Loading monsters...</p>
      </div>
    </div>

    <AddMonsterModal
        :is-open="showAddModal"
        @close="showAddModal = false"
    />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

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
  cursor: pointer;
}

li:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

li.blink {
  animation: blink 0.5s ease-in-out;
}

@keyframes blink {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(74, 144, 226, 0.3); }
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

.monsters-scroll-container {
  max-height: 60vh; /* Justera vid behov */
  overflow-y: auto;
}

/* Scroll styling */
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
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

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

  /* Hide AC on small screens */
  .monster-list-header span:nth-child(5),
  li .monster-ac {
    display: none;
  }
}
</style>
