<script setup>
import { saveCombatMonsters, store, removeFromFavorites } from '../store.js'

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

const removeFromFavoriteList = (monster, event) => {
  event.preventDefault()
  event.stopPropagation()
  removeFromFavorites(monster)
}

const exportFavorites = () => {
  const dataStr = JSON.stringify(store.favoriteMonsters, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `favorite-monsters-${new Date().toISOString().split('T')[0]}.json`
  link.click()
}
</script>

<template>
  <div class="favorite-container container">
    <div class="header">
      <h1>Favorite Monsters</h1>
      <button v-if="store.favoriteMonsters.length > 0" @click="exportFavorites">
        Export JSON
      </button>
    </div>

    <div v-if="store.favoriteMonsters.length === 0" class="empty-state">
      <p>No favorite monsters yet. Add some from the monster search!</p>
    </div>

    <div v-else>
      <p class="favorite-count">{{ store.favoriteMonsters.length }} favorite monster{{ store.favoriteMonsters.length !== 1 ? 's' : '' }}</p>

      <h3 class="monster-list-header">
        <span>Name</span>
        <span>CR</span>
        <span>HP</span>
        <span>Remove</span>
      </h3>

      <ul>
        <li v-for="monster in store.favoriteMonsters" @click="addToCombatList(monster, $event)" :key="monster.id">
          <span>{{ monster.label }}</span>
          <span>{{ monster.challengeRating }}</span>
          <span>{{ monster.hitPoints }}</span>
          <span>
            <button
                @click="removeFromFavoriteList(monster, $event)"
                class="remove-btn"
                title="Remove from favorites">
              ✕
            </button>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Använd samma styling som TheMonsterList */
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

.blink {
  animation: blink-animation 1s;
}

.monster-list-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
}

.monster-list-header span:first-child {
  flex-grow: 2;
  text-align: left;
}

.monster-list-header span:nth-child(2) {
  flex-grow: 1;
  margin-left: auto;
  padding-left: 1rem;
  text-align: center;
}

.monster-list-header span:nth-child(3) {
  flex-grow: 1;
  text-align: right;
  margin-right: 1rem;
}

.monster-list-header span:last-child {
  flex-grow: 0;
  width: 4rem;
  text-align: center;
}

li {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

li span:first-child {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 2;
}

li span:nth-child(2) {
  flex-grow: 1;
  margin-left: 1rem;
  text-align: center;
}

li span:nth-child(3) {
  text-align: right;
  margin-right: 1rem;
}

li span:last-child {
  flex-grow: 0;
  width: 4rem;
  text-align: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-count {
  margin-bottom: 1rem;
  color: #ccc;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #ff4444;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: rgba(255, 68, 68, 0.2);
  color: #ff6666;
}

@media (min-width: 768px) {
  .favorite-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .favorite-container {
    padding: 2rem;
  }
}
</style>
