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
header {
  line-height: 1.5;
}

main {
  display: flex;
  flex-flow: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  main {
    flex-direction: row;
    justify-content: space-evenly;
  }

}
</style>
