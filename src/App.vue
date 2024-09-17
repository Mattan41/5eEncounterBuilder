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
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ccc;
  }

  li span {
    flex: 1;
    text-align: center;
  }

  li span:first-child {
    text-align: left;
  }

  li span:last-child {
    text-align: right;
  }
}
</style>