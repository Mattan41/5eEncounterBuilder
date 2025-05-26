<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { saveCombatMonsters, store } from '../store.js'

const monsters = ref([])
const header = ref('Monster List')
const editing = ref(false)
const searchQuery = ref('') // Nytt sökfält
const newMonster = ref("")
const newMonsterHP = ref(0)
const newMonsterCR = ref("0")
const newMonsterInCombat = ref(false)

const showAdvancedSearch = ref(false)
const selectedCR = ref('')
const selectedType = ref('')


// Nya variabler för infinite scroll
const totalResults = ref(0)
const currentPage = ref(1)
const isLoading = ref(false)
const hasMoreResults = ref(false)
const resultsPerPage = 10

// Funktion för att söka efter monster
// const searchMonsters = async (resetResults = true) => {
//   if (isLoading.value) return
//
//   try {
//     isLoading.value = true
//
//     if (resetResults) {
//       monsters.value = []
//       currentPage.value = 1
//     }
//
//     const offset = (currentPage.value - 1) * resultsPerPage
//     const response = await fetch(`https://api.open5e.com/v1/monsters/?search=${searchQuery.value}&limit=${resultsPerPage}&offset=${offset}`)
//     const data = await response.json()
//
//     totalResults.value = data.count
//     hasMoreResults.value = data.next !== null
//
//     const newMonsters = data.results.map((monster, index) => ({
//       id: `api_${offset + index}`,
//       label: monster.name,
//       challengeRating: parseFloat(monster.challenge_rating),
//       hitPoints: monster.hit_points,
//       originalHitPoints: monster.hit_points,
//     }))
//
//     if (resetResults) {
//       monsters.value = newMonsters
//     } else {
//       monsters.value.push(...newMonsters)
//     }
//
//   } catch (error) {
//     console.log('Error fetching monsters', error)
//   } finally {
//     isLoading.value = false
//   }
// }

// Uppdaterad searchMonsters funktion
const searchMonsters = async (resetResults = true) => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    if (resetResults) {
      monsters.value = []
      currentPage.value = 1
    }

    const offset = (currentPage.value - 1) * resultsPerPage

    // Använd search-parametern för partiell matchning istället för search=
    const response = await fetch(
        `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(searchQuery.value)}&limit=${resultsPerPage}&offset=${offset}&ordering=challenge_rating`
    )
    const data = await response.json()

    totalResults.value = data.count
    hasMoreResults.value = data.next !== null

    const newMonsters = data.results.map((monster, index) => ({
      id: `api_${offset + index}`,
      label: monster.name,
      challengeRating: parseFloat(monster.challenge_rating),
      hitPoints: monster.hit_points,
      originalHitPoints: monster.hit_points,
      type: monster.type, // Lägg till monster-typ
      size: monster.size, // Lägg till storlek
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


// Funktion för att ladda fler resultat
const loadMoreResults = async () => {
  if (!hasMoreResults.value || isLoading.value) return

  currentPage.value++
  await searchMonsters(false)
}

// Scroll event listener för infinite scrolling
const handleScroll = () => {
  const scrollContainer = document.querySelector('.monsters-scroll-container')
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const threshold = 100 // Börja ladda när 100px från botten

  if (scrollHeight - scrollTop - clientHeight < threshold && hasMoreResults.value && !isLoading.value) {
    loadMoreResults()
  }
}

// Funktion för att spara nya monster
const saveMonster = () => {
  const monster = {
    id: `custom_${Date.now()}`,
    label: newMonster.value,
    challengeRating: parseFloat(newMonsterCR.value),
    hitPoints: newMonsterHP.value,
    originalHitPoints: newMonsterHP.value,
  }
  monsters.value.unshift(monster) // Lägg till i början av listan
  if (newMonsterInCombat.value) {
    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
    saveCombatMonsters()
  }
  newMonster.value = ""
  newMonsterHP.value = null
  newMonsterCR.value = ""
  newMonsterInCombat.value = false
}

// Lägg till monster i combat-listan
const addToCombatList = (monster, event) => {
  event.preventDefault()
  if (event.type === 'click') {
    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
    saveCombatMonsters()
    const listItem = event.currentTarget
    listItem.classList.add('blink')
    setTimeout(() => {
      listItem.classList.remove('blink')
    }, 1000)
  }
}

const doEdit = (e) => {
  editing.value = e
  newMonster.value = ""
  newMonsterHP.value = null
  newMonsterCR.value = ""
  newMonsterInCombat.value = false
}

// Event listeners för scroll
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

    <form class="search-form" @submit.prevent="searchMonsters">
      <input v-model="searchQuery" type="text" placeholder="Search for monsters">
      <button :disabled="!searchQuery" class="btn btn-primary">
        {{ isLoading ? 'Searching...' : 'Search' }}
      </button>
    </form>

    <!-- Lägg till filter om du vill -->
    <div class="filter-section" v-if="searchQuery">
      <label>
        <input type="checkbox" v-model="showAdvancedSearch"> Show filters
      </label>

      <div v-if="showAdvancedSearch" class="advanced-filters">
        <select v-model="selectedCR" @change="searchMonsters">
          <option value="">Any CR</option>
          <option value="0">CR 0</option>
          <option value="1">CR 1</option>
          <option value="2">CR 2</option>
          <option value="3">CR 3</option>
          <!-- etc -->
        </select>

        <select v-model="selectedType" @change="searchMonsters">
          <option value="">Any Type</option>
          <option value="dragon">Dragon</option>
          <option value="humanoid">Humanoid</option>
          <option value="beast">Beast</option>
          <!-- etc -->
        </select>
      </div>
    </div>

    <!-- Visa antal träffar -->
    <div v-if="totalResults > 0" class="search-results-info">
      <p>{{ totalResults }} monster{{ totalResults !== 1 ? 's' : '' }} found</p>
      <p v-if="monsters.length < totalResults">
        Showing {{ monsters.length }} of {{ totalResults }} results
      </p>
    </div>

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

    <h3 class="monster-list-header">
      <span>Name</span>
      <span>CR</span>
      <span>HP</span>
    </h3>

    <!-- Scrollbar container för infinite scroll -->
    <div class="monsters-scroll-container">
      <ul>
        <li v-for="monster in monsters" @click="addToCombatList(monster, $event)" :key="monster.id">
          <span>{{ monster.label }}</span>
          <span>{{ monster.challengeRating }}</span>
          <span>{{ monster.hitPoints }}</span>
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
/* Add the blink effect */
.blink {
  animation: blink-animation 1s;
}

/* Other styles from original */
h1 {
  position: relative;
  border-bottom: solid 1px #292929;
  margin-bottom: 10px;
}

h3 {
  position: relative;
  border-bottom: 2px solid #ccc;
}

ul {
  list-style: none;
  padding: 0;
}

.monster-list-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Monster name*/
.monster-list-header span:first-child {
  flex-grow: 2;
  text-align: left;
}

/*CR*/
.monster-list-header span:nth-child(2) {
  flex-grow: 1;
  margin-left: auto;
  padding-left: 1rem;
  text-align: center;
}

/*HP*/
.monster-list-header span:last-child {
  flex-grow: 1;
  text-align: right;
}

li {
  display: flex;
  justify-content: space-between;
}

li span {
  flex: 1;
  text-align: center;
}

/* Monster name*/
li span:first-child {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 2;
}

/*CR*/
li span:nth-child(2) {
  flex-grow: 1;
  margin-left: 1rem;
}

/*HP*/
li span:last-child {
  text-align: right;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-monsters-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-monsters-form input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #555;
  background-color: #444;
  color: white;
}

/* Nya stilar för sökfunktionen - matchar den ursprungliga stilen */
.search-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-form input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #555;
  background-color: #444;
  color: white;
}

.search-results-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  border-left: 4px solid #ccc;
}

.search-results-info p {
  margin: 0.25rem 0;
  color: #ccc;
  font-size: 0.9rem;
}

/* Scroll container - minimal styling för att passa originalet */
.monsters-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
}

/* Scrollbar styling för webkit browsers */
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

@media (min-width: 768px) {
  .monster-container {
    padding: 1.5rem;
  }

  .search-form {
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .monster-container {
    padding: 2rem;
  }
}
</style>
