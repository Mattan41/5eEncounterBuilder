<script setup>
import {store} from '../store.js'
import {ref} from 'vue'

const startX = ref(0)
const endX = ref(0)
const isCombatActive = ref(false)

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

const rollInitiative = (monster) => {
  monster.initiative = Math.floor(Math.random() * 20) + 1
}

const rollAllInitiatives = () => {
  store.combatMonsters.forEach(monster => {
    rollInitiative(monster)
  })
}
const toggleCombat = () => {
  isCombatActive.value = !isCombatActive.value
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
    <div :class="['header', { pulsate: isCombatActive }]">
      <h2>Combat!</h2>
      <div class="buttons">
        <button @click="rollAllInitiatives">Roll Initiative</button>
        <button @click="toggleCombat">{{ isCombatActive ? 'Pause Combat' : 'Start Combat' }}</button>
      </div>
    </div>
    <ol>
      <transition-group name="swipe" tag="ol">
        <li v-for="(monster, index) in store.combatMonsters"
            @click="toggleDone(monster)"
            @contextmenu="toggleInCombat(monster, $event)"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd(monster, $event)"
            :key="monster.combatId"
            class="static-class"
            :class="{ 'swipe-right': monster.swipedRight }">
          <div class="monster-info">
            <div class="monster-header" :class="{ priority: monster.inCombat, strikeout: monster.done }">
              <span class="monster-label">{{ monster.label }}</span>
              <span class="monster-hp">(HP: {{ monster.hitPoints }})</span>
            </div>
            <div class="damage-container">
              <input type="number" v-model.number="monster.initiative" @click.stop class="initiative-input"/>
              <div class="roll-initiative" @click.stop="rollInitiative(monster)">
                <img src="@/assets/d20.webp" alt="Roll initiative" class="d20-image"/>
                <span class="roll-text">Roll initiative</span>
              </div>
              <input type="number" v-model.number="monster.damage" placeholder="Damage" @click.stop
                     @keyup.enter="monster.damage && applyDamage(monster, monster.damage)" class="damage-input"/>
              <button v-if="monster.damage" @click.stop="applyDamage(monster, monster.damage)" class="apply-button">
                Apply
              </button>
            </div>
          </div>
        </li>
      </transition-group>
    </ol>
  </div>
</template>

<style scoped>

/* General Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #8B0000;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.header.pulsate {
  animation: pulsate 3s infinite;
  will-change: border-color;
}

h2 {
  position: relative;
  top: -10px;
  color: #FFD700;

}

.buttons {
  display: flex;
  gap: 0.5rem;
}

ol {
  list-style: none;
  padding: 0;
  margin: 0;
}


li {
  color: #FFD700;
}

.strikeout {
  text-decoration: line-through;
  color: #555555;
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

.initiative-input {
  width: 3rem;
  text-align: center;
  margin-right: 0.5rem;
  background-color: #444; /* Dark background */
  color: white;
  border: 1px solid #555;
  padding: 0.4rem;
  border-radius: 5px;
}

.roll-initiative {
  position: relative;
  display: inline-block;
  cursor: pointer;
}
.d20-image {
  width: 24px;
  height: 24px;
  filter: sepia(1) saturate(5) hue-rotate(-25deg);
}

.roll-text {
  visibility: hidden;
  width: 100px;
  background-color: rgba(128, 128, 128, 0.8);
  color: whitesmoke;
  text-align: center;
  border-radius: 6px;
  padding: 1px 0;
  position: absolute;
  z-index: 1;
  left: 125%; /* Position to the right of the image */
  top: 30%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.7s ease-in-out;
  font-size: 0.8rem; /* Smaller text */
}

.roll-initiative:hover .roll-text {
  visibility: visible;
  opacity: 1;
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