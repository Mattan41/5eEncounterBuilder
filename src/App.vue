<script setup>
import AppHeader from './components/AppHeader.vue'
import IntroBanner from './components/IntroBanner.vue'
import TheCombatList from './components/TheCombatList.vue'
import TheFavoriteList from './components/TheFavoriteList.vue'
import TheMonsterList from './components/TheMonsterList.vue'
import AboutModal from './modals/AboutModal.vue'
import { useUiState } from './composables/useUiState.js'

// Panel visibility is persisted, so a refresh restores the layout the user left.
const {
  uiState,
  showAbout,
  hasVisiblePanel,
  mainClass,
  toggleMonsterList,
  toggleFavoriteList,
  toggleCombatEncounter,
  closeAbout,
} = useUiState()
</script>

<template>
  <div class="app">
    <header>
      <AppHeader
        :show-monster-list="uiState.showMonsterList"
        :show-favorite-list="uiState.showFavoriteList"
        :show-combat-encounter="uiState.showCombatEncounter"
        @toggle-monster-list="toggleMonsterList"
        @toggle-favorite-list="toggleFavoriteList"
        @toggle-combat-encounter="toggleCombatEncounter"
      />
    </header>

    <IntroBanner v-if="!uiState.hasSeenIntro" />

    <main :class="mainClass">
      <TheCombatList v-if="uiState.showCombatEncounter" />
      <TheMonsterList v-if="uiState.showMonsterList" />
      <TheFavoriteList v-if="uiState.showFavoriteList" />

      <p v-if="!hasVisiblePanel" class="empty-state">
        All panels are hidden &mdash; use the buttons in the header to open one.
      </p>
    </main>

    <AboutModal :show="showAbout" @close="closeAbout" />
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
