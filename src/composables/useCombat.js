import { computed, ref } from 'vue'
import { store, saveCombatMonsters } from '../store.js'
import { normalizeCombatMonster } from '../utils/monsterId.js'

// Combat session state is shared across the app so every component observes the
// same round/initiative position.
const startX = ref(0)
const endX = ref(0)
const isCombatActive = ref(false)
const currentRound = ref(1)
const currentMonsterIndex = ref(0)
const hasCombatStarted = ref(false)
const isRoundBlinking = ref(false)

/**
 * Adds a monster to the combat list with a fresh combatId and tracks its
 * original hit points so "Reset combat" can restore them.
 * @param {object} monster
 * @returns {object} The created combat entry.
 */
export const addToCombat = (monster) => {
  const combatMonster = normalizeCombatMonster({
    ...monster,
    originalHitPoints: monster.originalHitPoints ?? monster.hitPoints ?? monster.hit_points,
    combatId: undefined,
  })

  store.combatMonsters.push(combatMonster)
  saveCombatMonsters()
  return combatMonster
}

const removeFromCombatList = (monster, event) => {
  if (event) event.preventDefault()

  const index = store.combatMonsters.findIndex((m) => m.combatId === monster.combatId)
  if (index !== -1) {
    store.combatMonsters.splice(index, 1)
  }
  saveCombatMonsters()
}

// Start/pause combat
const toggleCombat = () => {
  isCombatActive.value = !isCombatActive.value
  if (isCombatActive.value && !hasCombatStarted.value) {
    currentMonsterIndex.value = store.combatMonsters.reduce(
      (maxIndex, monster, index, monsters) =>
        monster.initiative > monsters[maxIndex].initiative ? index : maxIndex,
      0,
    )
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
  store.combatMonsters.forEach((monster) => {
    rollInitiative(monster)
  })
  saveCombatMonsters()
}

const sortByInitiative = () => {
  store.combatMonsters.sort((a, b) => b.initiative - a.initiative)
  saveCombatMonsters()
}

const sortedIndices = computed(() =>
  store.combatMonsters
    .map((monster, index) => ({ index, initiative: monster.initiative }))
    .sort((a, b) => b.initiative - a.initiative)
    .map((item) => item.index),
)

const nextInInitiative = () => {
  const currentIndex = sortedIndices.value.indexOf(currentMonsterIndex.value)
  if (currentIndex < sortedIndices.value.length - 1) {
    currentMonsterIndex.value = sortedIndices.value[currentIndex + 1]
  } else {
    triggerRoundBlink(() => {
      currentMonsterIndex.value = sortedIndices.value[0]
      currentRound.value++
    })
  }
  saveCombatMonsters()
}

const previousInInitiative = () => {
  const currentIndex = sortedIndices.value.indexOf(currentMonsterIndex.value)
  if (currentIndex > 0) {
    currentMonsterIndex.value = sortedIndices.value[currentIndex - 1]
  } else {
    triggerRoundBlink(() => {
      currentMonsterIndex.value = sortedIndices.value[sortedIndices.value.length - 1]
      currentRound.value = Math.max(1, currentRound.value - 1)
    })
  }
  saveCombatMonsters()
}

const triggerRoundBlink = (callback) => {
  isRoundBlinking.value = true
  setTimeout(() => {
    if (callback) callback()
    isRoundBlinking.value = false
  }, 500)
}

const resetCombat = () => {
  currentRound.value = 1
  currentMonsterIndex.value = 0
  isCombatActive.value = false
  hasCombatStarted.value = false
  store.combatMonsters.forEach((monster) => {
    monster.initiative = 0
    monster.done = false
    monster.hitPoints = monster.originalHitPoints
  })
  saveCombatMonsters()
}

const applyDamage = (monster, damage) => {
  monster.hitPoints -= damage
  monster.done = monster.hitPoints <= 0
  monster.damage = null
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
      removeFromCombatList(monster, event)
      saveCombatMonsters()
    }, 50)
  }
}

/**
 * Composable exposing combat session state and operations.
 * @returns {object}
 */
export const useCombat = () => ({
  combatMonsters: store.combatMonsters,
  addToCombat,
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
  startX,
  endX,
  isCombatActive,
  currentRound,
  currentMonsterIndex,
  hasCombatStarted,
  isRoundBlinking,
  sortedIndices,
})
