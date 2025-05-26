<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import TheMonsterList from './components/TheMonsterList.vue'
import TheFavoriteList from './components/TheFavoriteList.vue'
import TheCombatList from './components/TheCombatList.vue'

const showMonsterList = ref(false)
const showFavoriteList = ref(false)
const showCombatEncounter = ref(true) // Combat visas som standard

const toggleMonsterList = () => {
  showMonsterList.value = !showMonsterList.value
}

const toggleFavoriteList = () => {
  showFavoriteList.value = !showFavoriteList.value
}

const toggleCombatEncounter = () => {
  showCombatEncounter.value = !showCombatEncounter.value
}
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

    <main :class="getMainClass()">
      <TheCombatList v-if="showCombatEncounter" />
      <TheMonsterList v-if="showMonsterList" />
      <TheFavoriteList v-if="showFavoriteList" />
    </main>
  </div>
</template>

<script>
export default {
  methods: {
    getMainClass() {
      const visibleCount = [this.showCombatEncounter, this.showMonsterList, this.showFavoriteList]
          .filter(Boolean).length

      return {
        'single-column': visibleCount === 1,
        'two-columns': visibleCount === 2,
        'three-columns': visibleCount === 3
      }
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
}

/* Mobile first: alltid column layout */
main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet och desktop: grid layout */
@media (min-width: 768px) {
  main {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  .single-column {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .two-columns {
    grid-template-columns: 1fr 1fr;
  }

  .three-columns {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* För mycket stora skärmar: begränsa kolumnbredd */
@media (min-width: 1400px) {
  .three-columns {
    grid-template-columns: repeat(3, minmax(400px, 500px));
    justify-content: center;
  }
}
</style>
