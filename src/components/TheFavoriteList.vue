<script setup>
import { ref } from 'vue'
import CreatureModal from '@/modals/CreatureModal.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useCombat } from '@/composables/useCombat.js'

const { favoriteMonsters, removeFromFavorites } = useFavorites()
const { addToCombat } = useCombat()

const showCreatureModal = ref(false)
const selectedCreature = ref(null)

const addToCombatList = (monster, event) => {
  event.preventDefault()
  if (event.type !== 'click') return

  addToCombat(monster)

  const listItem = event.currentTarget
  listItem.classList.add('blink')
  setTimeout(() => {
    listItem.classList.remove('blink')
  }, 1000)
}

const removeFromFavoriteList = (monster, event) => {
  event.preventDefault()
  event.stopPropagation()
  removeFromFavorites(monster)
}

const showCreatureDetails = (monster, event) => {
  event.preventDefault()
  event.stopPropagation()
  selectedCreature.value = monster
  showCreatureModal.value = true
}

const closeCreatureModal = () => {
  showCreatureModal.value = false
  selectedCreature.value = null
}
</script>

<template>
  <div class="favorite-container container">
    <div class="header">
      <h1>⭐ Favorite Monsters</h1>
    </div>

    <div v-if="favoriteMonsters.length === 0" class="empty-state">
      <div class="empty-icon">⭐</div>
      <p>No favorite monsters yet</p>
      <small>Add some from the monster search!</small>
    </div>

    <div v-else class="favorites-content">
      <div class="favorite-stats">
        <span class="favorite-count"
          >{{ favoriteMonsters.length }} favorite{{
            favoriteMonsters.length !== 1 ? 's' : ''
          }}</span
        >
        <span class="click-hint">Click to add to combat</span>
      </div>

      <div class="monster-list-header">
        <span>Name</span>
        <span>Type</span>
        <span>CR</span>
        <span>HP</span>
        <span>Actions</span>
      </div>

      <div class="favorites-scroll-container">
        <ul>
          <li
            v-for="monster in favoriteMonsters"
            @click="addToCombatList(monster, $event)"
            :key="monster.id"
            class="favorite-item"
          >
            <span class="monster-name">{{ monster.label }}</span>
            <span class="monster-type">{{ monster.type }}</span>
            <span class="monster-cr">{{ monster.challengeRatingDisplay }}</span>
            <span class="monster-hp">{{ monster.hitPoints }}</span>
            <span class="monster-actions">
              <button
                @click="showCreatureDetails(monster, $event)"
                class="info-btn"
                title="Show creature details"
              >
                ℹ️
              </button>
              <button
                @click="removeFromFavoriteList(monster, $event)"
                class="remove-btn"
                title="Remove from favorites"
              >
                ✕
              </button>
            </span>
          </li>
        </ul>
      </div>
      <CreatureModal
        :show="showCreatureModal"
        :creature="selectedCreature"
        @close="closeCreatureModal"
      />
    </div>
  </div>
</template>

<style scoped>
.favorite-container {
  background: linear-gradient(135deg, #2a2419 0%, #1a1a1a 100%);
  border: 1px solid #8b6914;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.1);
}

/* Header styling */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #8b6914;
}

.header h1 {
  color: #ffa500;
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #ccc;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #ddd;
}

.empty-state small {
  color: #999;
  font-style: italic;
}

/* Actions buttons */
.monster-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}

.info-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #4caf50;
  padding: 0.25rem;
  border-radius: 3px;
  transition: all 0.3s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-btn:hover {
  background-color: rgba(76, 175, 80, 0.2);
  color: #66bb6a;
  transform: scale(1.1);
}

/* Favorites content */
.favorites-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Stats bar */
.favorite-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 165, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 165, 0, 0.2);
}

.favorite-count {
  color: #ffa500;
  font-weight: 600;
  font-size: 0.95rem;
}

.click-hint {
  color: #cccccc;
  font-size: 0.85rem;
  font-style: italic;
}

/* List header */
.monster-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.5fr;
  gap: 0.5rem;
  font-weight: 600;
  color: #ffa500;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 165, 0, 0.15);
  border-radius: 4px;
  border: 1px solid rgba(255, 165, 0, 0.3);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

/* Scroll container */
.favorites-scroll-container {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 60vh;
}

.favorites-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.favorites-scroll-container::-webkit-scrollbar-track {
  background: #2a2419;
  border-radius: 4px;
}

.favorites-scroll-container::-webkit-scrollbar-thumb {
  background: #8b6914;
  border-radius: 4px;
}

.favorites-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #b8861b;
}

/* List styling */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.favorite-item {
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.5fr;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 165, 0, 0.1);
  background: rgba(255, 165, 0, 0.05);
}

.favorite-item:hover {
  background: rgba(255, 165, 0, 0.15);
  border-color: rgba(255, 165, 0, 0.3);
  transform: translateX(2px);
}

.favorite-item:active {
  transform: translateX(0px) scale(0.98);
}

/* Monster info styling */
.monster-name {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #fff;
}

.monster-type,
.monster-cr,
.monster-hp {
  text-align: center;
  color: #ffcc80;
  font-size: 0.9rem;
}

.monster-actions {
  text-align: center;
}

/* Remove button */
.remove-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #ff6b6b;
  padding: 0.25rem;
  border-radius: 3px;
  transition: all 0.3s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: rgba(255, 107, 107, 0.2);
  color: #ff8a8a;
  transform: scale(1.1);
}

/* Blink animation */
@keyframes blink {
  0%,
  100% {
    background-color: rgba(255, 165, 0, 0.05);
  }
  50% {
    background-color: rgba(255, 165, 0, 0.3);
  }
}

.blink {
  animation: blink 1s ease-in-out;
}

/* Responsive design */
@media (max-width: 767px) {
  .header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .favorite-stats {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .monster-list-header {
    grid-template-columns: 2fr 1fr 0.6fr 0.4fr;
    font-size: 0.8rem;
  }

  .favorite-item {
    grid-template-columns: 2fr 1fr 0.6fr 0.4fr;
  }

  /* Hide Type on small screens */
  .monster-list-header span:nth-child(2),
  .favorite-item .monster-type {
    display: none;
  }
}

@media (max-width: 480px) {
  .monster-list-header {
    grid-template-columns: 2fr 0.8fr 0.4fr;
  }

  .favorite-item {
    grid-template-columns: 2fr 0.8fr 0.4fr;
  }

  /* Hide HP also on very small screens */
  .monster-list-header span:nth-child(4),
  .favorite-item .monster-hp {
    display: none;
  }
}
</style>
