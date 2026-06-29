<script setup>
import {computed, ref} from 'vue'
import AppHeader from './components/AppHeader.vue'
import TheMonsterList from './components/TheMonsterList.vue'
import TheFavoriteList from './components/TheFavoriteList.vue'
import TheCombatList from './components/TheCombatList.vue'

const showMonsterList = ref(false)
const showFavoriteList = ref(false)
const showCombatEncounter = ref(true)

const toggleMonsterList = () => {
  showMonsterList.value = !showMonsterList.value
}

const toggleFavoriteList = () => {
  showFavoriteList.value = !showFavoriteList.value
}

const toggleCombatEncounter = () => {
  showCombatEncounter.value = !showCombatEncounter.value
}

const getMainClass = computed(() => {
  const visibleCount = [
    showCombatEncounter.value,
    showMonsterList.value,
    showFavoriteList.value
  ].filter(Boolean).length

  return {
    'single-column': visibleCount === 1,
    'two-columns': visibleCount === 2,
    'three-columns': visibleCount === 3
  }
})
</script>

<template>
  <div class="app">
    <header>
      <AppHeader
          :show-monster-list="showMonsterList"
          :show-favorite-list="showFavoriteList"
          :show-combat-encounter="showCombatEncounter"
          @toggle-monster-list="toggleMonsterList"
          @toggle-favorite-list="toggleFavoriteList"
          @toggle-combat-encounter="toggleCombatEncounter"
      />
    </header>

    <main :class="getMainClass">
      <TheCombatList v-if="showCombatEncounter"/>
      <TheMonsterList v-if="showMonsterList"/>
      <TheFavoriteList v-if="showFavoriteList"/>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  main {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    max-width: 100%;
  }

  main.single-column {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 0 auto;
  }

  main.two-columns {
    grid-template-columns: 1fr 1fr;
    max-width: 1400px;
    margin: 0 auto;
  }

  main.three-columns {
    display: flex;
    flex-direction: column;
    max-width: 1600px;
    margin: 0 auto;
  }
}

/* Larger screens: three-column layout */
@media (min-width: 1200px) {
  main.three-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1rem;
  }

  main.three-columns > :first-child {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1800px) {
  main.three-columns {
    grid-template-columns: repeat(3, minmax(400px, 1fr));
    grid-template-rows: auto;
  }

  main.three-columns > :first-child {
    grid-column: auto;
  }
}
</style>
