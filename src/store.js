// store.js
import { reactive } from 'vue'

const loadCombatMonsters = () => {
  const savedCombatMonsters = localStorage.getItem('combatMonsters')
  return savedCombatMonsters ? JSON.parse(savedCombatMonsters) : []
}

export const store = reactive({
  combatMonsters: loadCombatMonsters()
})

export const saveCombatMonsters = () => {
  localStorage.setItem('combatMonsters', JSON.stringify(store.combatMonsters))
}