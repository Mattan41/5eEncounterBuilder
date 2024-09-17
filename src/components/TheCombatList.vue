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
const applyDamage = (monster, damage) => {
  monster.hitPoints -= damage
  if (monster.hitPoints <= 0) {
    toggleDone(monster)
  }
}
</script>

<template>
  <div class="combat-container">
    <h2>Combat</h2>
  <ol>
    <li v-for="(monster, index) in store.combatMonsters" @click="toggleDone(monster)" @contextmenu="togglePriority(monster, $event)" :key="monster.id" class="static-class" :class="{
      strikeout: monster.done,
      priority: monster.inCombat
    }">
      <span>{{ monster.label }} (HP: {{ monster.hitPoints }})</span>
      <input type="number" v-model.number="monster.damage" placeholder="Damage" @click.stop @keyup.enter="applyDamage(monster, monster.damage)"/>
      <button @click.stop="applyDamage(monster, monster.damage)">Apply</button>
    </li>
  </ol>
</div>
</template>

<style scoped>
h2 {
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
  top: -10px;
  color: crimson;
}

.strikeout {
  text-decoration: line-through;
  color: unset;
}
li{
    color: crimson;
}
</style>
