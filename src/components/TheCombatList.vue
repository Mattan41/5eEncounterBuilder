<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useCombat } from '@/composables/useCombat.js'
import { useUiState } from '@/composables/useUiState.js'

// Lets the empty state guide a first-time user to the next step.
const { openMonsterList, openAbout } = useUiState()

// All initiative/round logic lives in useCombat.
const {
  combatMonsters,
  removeFromCombatList,
  toggleCombat,
  toggleDone,
  rollInitiative,
  rollAllInitiatives,
  sortByInitiative,
  nextInInitiative,
  previousInInitiative,
  resetCombat,
  applyDamage,
  handleTouchStart,
  handleTouchEnd,
  isCombatActive,
  currentRound,
  currentMonsterIndex,
  isRoundBlinking,
} = useCombat()
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
        <BaseButton variant="primary" @click="rollAllInitiatives">Roll Initiative</BaseButton>
        <BaseButton variant="secondary" @click="sortByInitiative">Sort</BaseButton>
        <BaseButton variant="ghost" toggle :active="isCombatActive" @click="toggleCombat">
          {{ isCombatActive ? 'Pause Combat' : 'Start Combat' }}
        </BaseButton>
      </div>
      <div class="sub-buttons" v-show="isCombatActive">
        <BaseButton variant="secondary" @click="previousInInitiative">Previous</BaseButton>
        <BaseButton variant="secondary" @click="nextInInitiative">Next</BaseButton>
        <BaseButton variant="danger" @click="resetCombat">Reset combat</BaseButton>
      </div>
    </div>

    <ol>
      <transition-group name="swipe" tag="ol">
        <li
          v-for="(monster, index) in combatMonsters"
          :key="monster.combatId"
          @click="toggleDone(monster)"
          @contextmenu="removeFromCombatList(monster, $event)"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd(monster, $event)"
          :class="{
            'swipe-right': monster.swipedRight,
            'current-monster': isCombatActive && index === currentMonsterIndex,
          }"
        >
          <div class="monster-info">
            <div class="monster-header" :class="{ strikeout: monster.done }">
              <div class="initiative-group">
                <input
                  type="number"
                  v-model.number="monster.initiative"
                  @change="saveCombatMonsters"
                  @click.stop
                  class="initiative-input"
                />
                <div class="roll-initiative" @click.stop="rollInitiative(monster)">
                  <img src="@/assets/d20.webp" alt="Roll initiative" class="d20-image" />
                  <span class="roll-text">Roll initiative</span>
                </div>
              </div>
              <span class="monster-label">{{ monster.label }}</span>
              <span class="monster-hp">(HP: {{ monster.hitPoints }})</span>
            </div>

            <div class="damage-container">
              <input
                type="number"
                v-model.number="monster.damage"
                placeholder="Damage"
                @click.stop
                @keyup.enter="monster.damage && applyDamage(monster, monster.damage)"
                class="damage-input"
              />
              <BaseButton
                v-if="monster.damage"
                variant="primary"
                size="sm"
                class="apply-button"
                @click.stop="applyDamage(monster, monster.damage)"
              >
                Apply
              </BaseButton>
            </div>
          </div>
        </li>
      </transition-group>
    </ol>

    <div v-if="combatMonsters.length === 0" class="combat-empty">
      <p>Nothing in the encounter yet.</p>
      <p class="combat-empty-hint">
        Search the monster library, click a row to add it here, then roll initiative.
      </p>
      <div class="combat-empty-actions">
        <BaseButton variant="primary" @click="openMonsterList">Search Monsters</BaseButton>
        <BaseButton variant="secondary" @click="openAbout">What is this?</BaseButton>
      </div>
    </div>

    <div v-if="isRoundBlinking" class="overlay"></div>
  </div>
</template>
<style scoped>
/* Transition animations */
.round-blink-enter-active,
.round-blink-leave-active {
  transition: opacity 0.5s;
}

.round-blink-enter-from,
.round-blink-leave-to {
  opacity: 0;
}

/* Header layout */
.header {
  display: grid;
  align-items: center;
  border-bottom: 3px solid var(--crimson);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.header.pulsate {
  animation: pulsate 3s infinite;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sub-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

h2 {
  position: relative;
  top: -10px;
  color: var(--gold);
  margin: 0;
}

/* Monster layout */
.monster-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.monster-header {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  min-width: 0;
}

.monster-label {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.monster-hp {
  text-align: right;
  white-space: nowrap;
}

/* Initiative styling */
.initiative-group {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.initiative-input {
  width: 2rem;
  text-align: center;
  margin-right: 0.5rem;
  background-color: var(--surface-input);
  color: var(--text-strong);
  border: 1px solid var(--border-strong);
  padding: 0.2rem;
  border-radius: var(--radius-md);
}

/* D20 and tooltip */
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
  left: 125%;
  top: 30%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.7s ease-in-out;
  font-size: 0.8rem;
}

.roll-initiative:hover .roll-text {
  visibility: visible;
  opacity: 1;
}

/* Damage container */
.damage-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.damage-input {
  background-color: #444;
  color: white;
  border: 1px solid #555;
  padding: 0.4rem;
  border-radius: 5px;
  flex: 1;
  min-width: 0;
}

.apply-button {
  padding: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Combat states */
.strikeout {
  text-decoration: line-through;
  color: #555555;
}

.current-monster {
  background-color: rgba(255, 255, 0, 0.2);
  border-left: 4px solid #ffd700;
}

/* Swipe animation */
.swipe-right {
  animation: swipeRight 0.5s forwards;
}

@keyframes swipeRight {
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive design */
@media (min-width: 768px) {
  .initiative-group {
    font-size: 1rem;
  }

  .initiative-input {
    width: 3rem;
    padding: 0.4rem;
  }

  .roll-initiative {
    font-size: 1rem;
  }

  .d20-image {
    width: 28px;
  }
}

@media (min-width: 1024px) {
  .monster-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .monster-header {
    gap: 1rem;
  }
}

/* Empty state */
.combat-empty {
  text-align: center;
  padding: 1.5rem 1rem;
}

.combat-empty-hint {
  font-size: 0.9rem;
}

.combat-empty-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
</style>
