<script setup>
import {ref, onMounted} from 'vue'
import {store} from '../store.js'

// props
defineProps({
  addMonsterButton: {
    type: String,
    default: 'add monsters'
  }
});

const header = ref('Monster List')
const editing = ref(false)
const newMonster = ref("")
const newMonsterHP = ref(0)
const newMonsterCR = ref("0")
const newMonsterInCombat = ref(false)

onMounted(async () => {
  try {
    const response = await fetch('https://api.open5e.com/v1/monsters/?page=2')
    const data = await response.json()
    store.monsters = data.results.slice(20, 30).map((monster, index) => ({
      id: store.monsters.length + index + 1,
      label: monster.name,
      challengeRating: parseFloat(monster.challenge_rating),
      hitPoints: monster.hit_points,
      done: false,
      inCombat: false,
      count: 0
    }))
  } catch (error) {
    console.log('Error fetching monsters', error)
  }
})

const saveMonster = () => {
  const monster = {
    id: store.monsters.length + 1,
    label: newMonster.value,
    challengeRating: parseFloat(newMonsterCR.value),
    hitPoints: newMonsterHP.value,
    done: false,
    inCombat: newMonsterInCombat.value,
    count: 0
  }
  store.monsters.push(monster)
  if (newMonsterInCombat.value) {
    store.combatMonsters.push({ ...monster, combatId: Date.now() })
    monster.count++
  }
  newMonster.value = ""
  newMonsterHP.value = null
  newMonsterCR.value = ""
  newMonsterInCombat.value = false
}

const doEdit = (e) => {
  editing.value = e
  newMonster.value = ""
  newMonsterHP.value = null
  newMonsterCR.value = ""
  newMonsterInCombat.value = false
}
// Add/remove monster on combatList

const toggleInCombat = (monster, event) => {
  event.preventDefault()
  if (event.type === 'click') {
    if (monster.count === 0) {
      monster.inCombat = true
    }
    store.combatMonsters.push({ ...monster, combatId: Date.now() })
    monster.count++
  }
}
</script>


<template>
  <div class="monster-container">
    <div class="header">
      <h1>{{ header }}</h1>
      <button v-if="editing" class="btn" @click="doEdit(false)">
        Cancel
      </button>
      <button v-else class="btn btn-primary" @click="doEdit(true)">
        {{ addMonsterButton }}
      </button>
    </div>
    <form class="add-monsters-form" v-if="editing" @submit.prevent="saveMonster">
      <input v-model.trim="newMonster" type="text" placeholder="Monster Name">
      <input v-model.number="newMonsterHP" type="number" placeholder="Hit Points">
      <input v-model.trim="newMonsterCR" type="text" placeholder="Challenge Rating">
      <label for="newMonster">
        <input type="checkbox" v-model="newMonsterInCombat">
        Active in combat
      </label>
      <button :disabled="newMonster.length < 1 || newMonsterHP <= 0 || !newMonsterCR" class="btn btn-primary">
        Save monster
      </button>
    </form>
    <h3 class="monster-list-header">
      <span>Name</span>
      <span>CR</span>
      <span>HP</span>
    </h3>
    <ul>
      <li v-for="(monster, index) in store.monsters" @click="toggleInCombat(monster, $event)"
          :key="monster.id" class="static-class"
          :class="{ priority: monster.inCombat }">
        <span>({{ monster.count }}) {{monster.label }}</span>
        <span>{{ monster.challengeRating }}</span>
        <span>{{ monster.hitPoints }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
  color: #ff9100;
}
h3 {
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
  top: -10px;
  color: #ff9100;
  border-bottom: 2px solid #ccc;
}

button {
  padding: 0.5rem;
}
ul {
  list-style: none;
  padding: 0;
}

.priority {
  color: #ff9100;
}

.monster-list-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
}
.monster-list-header span:first-child {
  flex-grow: 2; /* Increase space for the monster name */
  text-align: left;
}

.monster-list-header span:nth-child(2) {
  flex-grow: 1;
  margin-left: auto; /* Push CR to the right */
  padding-left: 1rem; /* Optional: Add padding for better spacing */
  text-align: center;
}

.monster-list-header span:last-child {
  flex-grow: 1;
  text-align: right;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
  background-color: #333;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s, transform 0.3s;
}

li:hover {
  background-color: #444;
  transform: translateY(-2px);
}

li span {
  flex: 1;
  text-align: center;
}

li span:first-child {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 2; /* Increase space for the monster name */
}

li span:nth-child(2) {
  flex-grow: 1;
  margin-left: 1rem; /* Adjust the margin to move CR to the right */
}

li span:last-child {
  text-align: right;
}

.monster-container {
  padding: 1rem;
  border-radius: 8px;
  background-color: #222;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 1rem 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-monsters-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.add-monsters-form input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #555;
  background-color: #444;
  color: white;
}

@media (min-width: 768px) {
  .monster-container {
    padding: 1.5rem;
  }

  li {
    padding: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .monster-container {
    padding: 2rem;
  }

  li {
    padding: 1rem;
  }
}
</style>