<script setup>
import { ref } from 'vue'
import MonsterSearch from '@/components/MonsterSearch.vue'
import AddMonsterModal from '@/modals/AddMonsterModal.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useCombat } from '@/composables/useCombat.js'
import { provideMonsterSearch } from '@/composables/useMonsterSearch.js'

const header = ref('Monster List')
const showAddModal = ref(false)

// Search/filter/sort is owned here and provided to MonsterSearch.
const { displayMonsters, isLoading, sortMonsters, getSortIcon, getSortClass } =
  provideMonsterSearch()
const { addToFavorites } = useFavorites()
const { addToCombat } = useCombat()

const addToCombatList = (monster, event) => {
  event.preventDefault()
  if (event.type !== 'click') return

  addToFavorites(monster)
  addToCombat(monster)

  const listItem = event.currentTarget
  listItem.classList.add('blink')
  setTimeout(() => {
    listItem.classList.remove('blink')
  }, 1000)
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
</script>

<template>
  <div class="monster-container container">
    <div class="header">
      <h1>{{ header }}</h1>
      <button @click="showAddModal = true" class="btn btn-primary">+ Add Monster</button>
    </div>

    <MonsterSearch />

    <div class="monster-list-header">
      <span @click="sortMonsters('name')" :class="getSortClass('name')" class="sortable">
        Name {{ getSortIcon('name') }}
      </span>
      <span @click="sortMonsters('type')" :class="getSortClass('type')" class="sortable">
        Type {{ getSortIcon('type') }}
      </span>
      <span
        @click="sortMonsters('challengeRating')"
        :class="getSortClass('challengeRating')"
        class="sortable"
      >
        CR {{ getSortIcon('challengeRating') }}
      </span>
      <span @click="sortMonsters('hitPoints')" :class="getSortClass('hitPoints')" class="sortable">
        HP {{ getSortIcon('hitPoints') }}
      </span>
      <span
        @click="sortMonsters('armorClass')"
        :class="getSortClass('armorClass')"
        class="sortable"
      >
        AC {{ getSortIcon('armorClass') }}
      </span>
      <span>Fav</span>
    </div>

    <p v-if="displayMonsters.length > 0">Found {{ displayMonsters.length }} monsters</p>

    <div class="monsters-scroll-container">
      <ul>
        <li
          v-for="monster in displayMonsters"
          @click="addToCombatList(monster, $event)"
          :key="monster.id"
        >
          <span class="monster-name">{{ monster.label }}</span>
          <span class="monster-type">{{ monster.type }}</span>
          <span class="monster-cr">{{ monster.challengeRatingDisplay }}</span>
          <span class="monster-hp">{{ monster.hitPoints }}</span>
          <span class="monster-ac">{{ monster.armorClass || '-' }}</span>
          <span class="monster-fav">
            <button
              @click="addToFavoritesOnly(monster, $event)"
              class="favorite-btn"
              title="Add to favorites"
            >
              ☆
            </button>
          </span>
        </li>
      </ul>

      <div v-if="isLoading" class="loading-indicator">
        <p>Loading monsters...</p>
      </div>
    </div>

    <AddMonsterModal :is-open="showAddModal" @close="showAddModal = false" />
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

/* Monster list header with sorting */
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
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(74, 144, 226, 0.3);
  }
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

/* Loading and end states */
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

/* Responsive design */
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
