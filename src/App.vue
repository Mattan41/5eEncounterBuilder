<!-- I din App.vue eller huvudkomponent -->
<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import TheMonsterList from './components/TheMonsterList.vue'
import TheFavoriteList from './components/TheFavoriteList.vue'
import TheCombatList from './components/TheCombatList.vue'

const showMonsterList = ref(false)
const showFavoriteList = ref(false)

const toggleMonsterList = () => {
  showMonsterList.value = !showMonsterList.value
}

const toggleFavoriteList = () => {
  showFavoriteList.value = !showFavoriteList.value
}
</script>

<template>
  <div class="app">
    <AppHeader
        :show-monster-list="showMonsterList"
        :show-favorite-list="showFavoriteList"
        @toggle-monster-list="toggleMonsterList"
        @toggle-favorite-list="toggleFavoriteList"
    />

    <div class="content-grid">
      <TheCombatList />
      <TheMonsterList v-if="showMonsterList" />
      <TheFavoriteList v-if="showFavoriteList" />
    </div>
  </div>
</template>

<style scoped>
.content-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}
</style>
