<script setup>
import TheMonsterList from './components/TheMonsterList.vue'
import TheCombatList from './components/TheCombatList.vue'
</script>

<template>
  <main>
    <TheMonsterList addMonsterButton="add monster"/>
    <TheCombatList/>
  </main>
</template>

<style scoped>

main {
  display: flex;
  flex-flow: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

}
</style>