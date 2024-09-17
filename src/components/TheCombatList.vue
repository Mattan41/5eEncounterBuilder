<script setup>
import { store } from '../assets/store'
import { ref } from 'vue'

const startX = ref(0)
const endX = ref(0)
const toggleDone = (monster) => {
  monster.done = !monster.done
}

const togglePriority = (monster, event) => {
  event.preventDefault()
  monster.inCombat = !monster.inCombat
  if (!monster.inCombat) {
    const index = store.combatMonsters.findIndex(m => m.combatId === monster.combatId)
    if (index !== -1) {
      store.combatMonsters.splice(index, 1)
      const originalMonster = store.monsters.find(m => m.id === monster.id)
      if (originalMonster) {
        originalMonster.count--
        if (originalMonster.count === 0) {
          originalMonster.inCombat = false;
        }
      }
    }
  }
}

const applyDamage = (monster, damage) => {
  monster.hitPoints -= damage
  if (monster.hitPoints <= 0) {
    toggleDone(monster)
  }
}

const handleTouchStart = (event) => {
  startX.value = event.touches[0].clientX
}

const handleTouchEnd = (monster, event) => {
  endX.value = event.changedTouches[0].clientX
  if (startX.value < endX.value - 50) { // Swipe right threshold
    togglePriority(monster, event)
  }
}

</script>

<template>
  <div class="combat-container">
    <h2>Combat</h2>
    <ol>
      <li v-for="(monster, index) in store.combatMonsters"
          @click="toggleDone(monster)"
          @contextmenu="togglePriority(monster, $event)"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd(monster, $event)"
          :key="monster.combatId"
          class="static-class"
          :class="{ strikeout: monster.done, priority: monster.inCombat }">
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

li {
  color: crimson;
  padding: 0.5rem;
  border-bottom: 1px solid #504f4f;
}

ul {
  list-style: none;
  padding: 0;
}

</style>