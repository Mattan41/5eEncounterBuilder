<script setup>
import { store } from '../assets/store'

const toggleDone = (monster) => {
  monster.done = !monster.done
}

const togglePriority = (monster, event) => {
  event.preventDefault()
  monster.inCombat = !monster.inCombat
  if (!monster.inCombat) {
    const index = store.combatMonsters.findIndex(m => m.id === monster.id)
    if (index !== -1) {
      store.combatMonsters.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="header">
    <h1>Combat Monsters</h1>
  </div>
  <ul>
    <li v-for="(monster, index) in store.combatMonsters" @click="toggleDone(monster)" @contextmenu="togglePriority(monster, $event)" :key="monster.id" class="static-class" :class="{
      strikeout: monster.done,
      priority: monster.inCombat
    }">
      {{ monster.label }}
    </li>
  </ul>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.strikeout {
  text-decoration: line-through;
}
.priority {
  color: #ff9100;
}
</style>
