<script setup>
import {saveCombatMonsters, store} from '../store.js'
import {computed, ref} from 'vue'


const startX = ref(0)
const endX = ref(0)
const isCombatActive = ref(false)
const currentRound = ref(1)
const currentMonsterIndex = ref(0)
const hasCombatStarted = ref(false)
const isRoundBlinking = ref(false);

const toggleInCombat = (monster, event) => {
  event.preventDefault();
  const index = store.combatMonsters.findIndex(m => m.combatId === monster.combatId);
  if (index !== -1) {
    store.combatMonsters.splice(index, 1);
    saveCombatMonsters();
  } else {
    store.combatMonsters.push({...monster, combatId: Date.now(), initiative: 0});
    saveCombatMonsters();
  }
  monster.inCombat = !monster.inCombat;
};


const toggleCombat = () => {
  isCombatActive.value = !isCombatActive.value
  if (isCombatActive.value && !hasCombatStarted.value) {
    currentMonsterIndex.value = store.combatMonsters.reduce((maxIndex, monster, index, monsters) =>
        monster.initiative > monsters[maxIndex].initiative ? index : maxIndex, 0)
    hasCombatStarted.value = true
  }
}

const toggleDone = (monster) => {
  monster.done = !monster.done
}

const rollInitiative = (monster) => {
  monster.initiative = Math.floor(Math.random() * 20) + 1
}
const rollAllInitiatives = () => {
  store.combatMonsters.forEach(monster => {
    rollInitiative(monster)
  })
  saveCombatMonsters()
}

//Sort the list displayed by initiative
const sortByInitiative = () => {
  store.combatMonsters.sort((a, b) => b.initiative - a.initiative)
  saveCombatMonsters()
}

//Computed property to get the sorted indices
const sortedIndices = computed(() => {
  return store.combatMonsters
      .map((monster, index) => ({index, initiative: monster.initiative}))
      .sort((a, b) => b.initiative - a.initiative)
      .map(item => item.index)
})

const nextInInitiative = () => {
  const currentIndex = sortedIndices.value.indexOf(currentMonsterIndex.value);
  if (currentIndex < sortedIndices.value.length - 1) {
    currentMonsterIndex.value = sortedIndices.value[currentIndex + 1];
  } else {
    triggerRoundBlink(() => {
      currentMonsterIndex.value = sortedIndices.value[0];
      currentRound.value++;
    });
  }
  saveCombatMonsters();
};

const previousInInitiative = () => {
  const currentIndex = sortedIndices.value.indexOf(currentMonsterIndex.value);
  if (currentIndex > 0) {
    currentMonsterIndex.value = sortedIndices.value[currentIndex - 1];
  } else {
    triggerRoundBlink(() => {
      currentMonsterIndex.value = sortedIndices.value[sortedIndices.value.length - 1];
      currentRound.value = Math.max(1, currentRound.value - 1);
    });
  }
  saveCombatMonsters();
};

const triggerRoundBlink = (callback) => {
  isRoundBlinking.value = true;
  setTimeout(() => {
    if (callback) callback();
    isRoundBlinking.value = false;
  }, 500);
};


const resetCombat = () => {
  currentRound.value = 1
  currentMonsterIndex.value = 0
  isCombatActive.value = false
  hasCombatStarted.value = false
  store.combatMonsters.forEach(monster => {
    monster.initiative = 0
    monster.done = false
    monster.inCombat = false
  })
  saveCombatMonsters()
}


const applyDamage = (monster, damage) => {
  monster.hitPoints -= damage
  monster.done = monster.hitPoints <= 0
  monster.damage = null // Reset the input field
  saveCombatMonsters()
}


const handleTouchStart = (event) => {
  startX.value = event.touches[0].clientX
}

const handleTouchEnd = (monster, event) => {
  endX.value = event.changedTouches[0].clientX
  if (startX.value < endX.value - 50) {
    monster.swipedRight = true
    setTimeout(() => {
      toggleInCombat(monster, event)
      saveCombatMonsters()
    }, 50)
  }
}

</script>
<template>
  <div class="combat-container container">
    <div :class="['header', { pulsate: isCombatActive }]">
      <div class="header-top">
        <h2>Combat!</h2>
        <transition name="round-blink">
          <p v-if="!isRoundBlinking">Round: {{ currentRound }}</p>
        </transition>
      </div>
      <div class="buttons">
        <button @click="rollAllInitiatives">Roll Initiative</button>
        <button @click="sortByInitiative">Sort</button>
        <button @click="toggleCombat">{{ isCombatActive ? 'Pause Combat' : 'Start Combat' }}</button>
      </div>
      <div class="sub-buttons" v-show="isCombatActive">
        <button @click="nextInInitiative">Next</button>
        <button @click="previousInInitiative">Previous</button>
        <button @click="resetCombat">Reset combat</button>
      </div>
    </div>
    <ol>
      <transition-group name="swipe" tag="ol">
        <li v-for="(monster, index) in store.combatMonsters" :key="monster.combatId"
            @click="toggleDone(monster)"
            @contextmenu="toggleInCombat(monster, $event)"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd(monster, $event)"
            class="static-class"
            :class="{ 'swipe-right': monster.swipedRight, 'current-monster': isCombatActive && index === currentMonsterIndex }">
          <div class="monster-info">
            <div class="monster-header" :class="{strikeout: monster.done }">
              <div class="initiative-group">
                <input type="number" v-model.number="monster.initiative" @click.stop class="initiative-input"/>
                <div class="roll-initiative" @click.stop="rollInitiative(monster)">
                  <img src="@/assets/d20.webp" alt="Roll initiative" class="d20-image"/>
                  <span class="roll-text">Roll initiative</span>
                </div>
              </div>
              <span class="monster-label">{{ monster.label }}</span>
              <span class="monster-hp">(HP: {{ monster.hitPoints }})</span>
            </div>
            <div class="damage-container">
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


.round-blink-enter-active, .round-blink-leave-active {
  transition: opacity 0.5s;
}

.round-blink-enter-from, .round-blink-leave-to {
  opacity: 0;
}

/* General Styles */
.header {
  display: grid;
  align-items: center;
  border-bottom: 3px solid #8B0000;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  width: 100%;

}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.sub-buttons {
  display: flex;
  gap: 0.5rem;
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

.current-monster {
  background-color: rgba(255, 255, 0, 0.2);
}

.monster-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.monster-header {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
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

.initiative-group {
  font-size: 0.8rem; /* Smaller font size */
}
.initiative-input {
  width: 2rem;
  text-align: center;
  margin-right: 0.5rem;
  background-color: #444; /* Dark background */
  color: white;
  border: 1px solid #555;
  padding: 0.2rem;
  border-radius: 5px;
}

.roll-initiative {
  font-size: 0.8rem;
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.d20-image {
  width: 20px;
  height: auto;
  filter: invert(0.3) sepia(1) saturate(3) hue-rotate(-25deg) drop-shadow(0 0 2px black);
  transition: filter 0.5s;
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

  .initiative-group {
    font-size: 1rem; /* Default font size */
  }
  .initiative-input {
    width: 3rem; /* Default width */
    padding: 0.4rem; /* Default padding */
  }

  .roll-initiative {
    font-size: 1rem; /* Default font size */
  }

  .d20-image {
    width: 28px; /* Default image size */
  }
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