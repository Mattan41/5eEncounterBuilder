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
  monster.done = monster.hitPoints <= 0
  monster.damage = null // Reset the input field
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
        <div class="monster-info">
          <div class="monster-header">
            <span class="monster-label">{{ monster.label }}</span>
            <span class="monster-hp">(HP: {{ monster.hitPoints }})</span>
          </div>
          <div class="damage-container">
            <input type="number" v-model.number="monster.damage" placeholder="Damage" @click.stop @keyup.enter="applyDamage(monster, monster.damage)" class="damage-input"/>
            <button v-if="monster.damage" @click.stop="applyDamage(monster, monster.damage)" class="apply-button">Apply</button>
          </div>
        </div>
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
  padding: 0.3rem;
  border-bottom: 1px solid #504f4f;
}

ul {
  list-style: none;
  padding: 0;
}

.monster-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.monster-header {
  display: flex;
  justify-content: space-between;
}

.monster-label {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monster-hp {
  text-align: right;
}

.damage-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.damage-input {
  background-color: #333; /* Dark background */
  color: white;
  border: 1px solid #555;
  padding: 0.2rem;
  border-radius: 5px;
}

.apply-button {
  padding: 0.2rem;
  margin-left: 10px;
}

.combat-container {
  padding: 1rem;
  border-radius: 8px;
}

@media (min-width: 768px) {
  .combat-container {
    padding: 1.5rem;
  }

  li {
    padding: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .combat-container {
    padding: 2rem;
  }

  .monster-info {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }

  li {
    padding: 1rem;
  }
}
</style>