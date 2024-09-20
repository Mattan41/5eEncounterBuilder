<script setup>
import TheMonsterList from './components/TheMonsterList.vue'
import TheCombatList from './components/TheCombatList.vue'
import AppHeader from './components/AppHeader.vue'
import {ref} from "vue";


const showMonsterList = ref(true)

const toggleMonsterList = () => {
  showMonsterList.value = !showMonsterList.value
}
</script>

<template>
  <AppHeader @toggleMonsterList="toggleMonsterList">
    {{ showMonsterList ? 'Hide' : 'Show' }} Monster List
  </AppHeader>
  <main :class="{ 'single-column': !showMonsterList }">
    <TheMonsterList v-show="showMonsterList" addMonsterButton="add monster"/>
    <TheCombatList/>
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