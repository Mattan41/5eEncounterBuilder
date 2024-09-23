<script setup>
import TheMonsterList from './components/TheMonsterList.vue'
import TheCombatList from './components/TheCombatList.vue'
import AppHeader from './components/AppHeader.vue'
import { store } from './store.js'
import {ref} from "vue";

const showMonsterList = ref(false)

const toggleMonsterList = () => {
  showMonsterList.value = !showMonsterList.value
}

const handleUpdateCount = (id, count) => {
  const monster = store.monsters.find(m => m.id === id)
  if (monster) {
    monster.count = count
  }
}
</script>

<template>
  <header>
    <AppHeader :showMonsterList="showMonsterList" @toggleMonsterList="toggleMonsterList"/>
  </header>
  <main :class="{ 'single-column': !showMonsterList }">
    <TheMonsterList v-show="showMonsterList" :monsters="store.monsters"/>
    <TheCombatList @updateCount="handleUpdateCount"/>
  </main>
</template>

<style scoped>

main {
  display: flex;
  flex-flow: column;
}

@media (min-width: 1024px) {
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .single-column {
    grid-template-columns: 1fr;
  }
}
</style>