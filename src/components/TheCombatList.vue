<script setup>
import { store } from '../store.js'
import { ref } from 'vue'

const startX = ref(0)
const endX = ref(0)
const toggleDone = (monster) => {
  monster.done = !monster.done
}

const toggleInCombat = (monster, event) => {
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
    monster.swipedRight = true
    setTimeout(() => {
      toggleInCombat(monster, event)
    }, 50) // Match the duration of the animation
  }
}

</script>
<template>
  <div class="combat-container container">
    <h2>Combat!</h2>
    <ol>
      <transition-group name="swipe" tag="ol">
        <li v-for="(monster, index) in store.combatMonsters"
            @click="toggleDone(monster)"
            @contextmenu="toggleInCombat(monster, $event)"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd(monster, $event)"
            :key="monster.combatId"
            class="static-class"
            :class="{ strikeout: monster.done, priority: monster.inCombat, 'swipe-right': monster.swipedRight }">
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
      </transition-group>
    </ol>
  </div>
</template>

<style scoped>

/* General Styles */
h2 {
  color: #FFD700;
  border-bottom: 3px solid #8B0000;
  animation: pulsate 3s infinite;
  will-change: border-color;
}

.strikeout {
  text-decoration: line-through;
  color: unset;
}

ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  color: #FFD700;
}

.swipe-right {
  animation: swipeRight 0.5s forwards;
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
  white-space: nowrap;
}

.damage-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.damage-input {
  background-color: #444; /* Dark background */
  color: white;
  border: 1px solid #555;
  padding: 0.4rem;
  border-radius: 5px;
}

.apply-button {
  padding: 0.4rem;
  margin-left: 10px;
}

/* Media Queries */
@media (min-width: 768px) {
  .combat-container {
    padding: 1.5rem;
  }

  li {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .combat-container {
    padding: 2rem;
  }

  .monster-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .monster-header {
    display: flex;
    gap: 1rem;
  }

  .damage-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  li {
    padding: 1rem;
  }
}
</style>