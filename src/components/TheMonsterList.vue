<script setup>
import { ref, onMounted } from 'vue'
import { saveCombatMonsters, store } from '../store.js'


const monsters = ref([])
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
    monsters.value = data.results.slice(20, 30).map((monster, index) => ({
      id: monsters.value.length + index + 1,
      label: monster.name,
      challengeRating: parseFloat(monster.challenge_rating),
      hitPoints: monster.hit_points,
      originalHitPoints: monster.hit_points,
      done: false,
      inCombat: false
    }))
  } catch (error) {
    console.log('Error fetching monsters', error)
  }
})

const saveMonster = () => {
  const monster = {
    id: monsters.value.length + 1,
    label: newMonster.value,
    challengeRating: parseFloat(newMonsterCR.value),
    hitPoints: newMonsterHP.value,
    originalHitPoints: newMonsterHP.value,
    done: false,
    inCombat: newMonsterInCombat.value
  }
  monsters.value.push(monster)
  if (newMonsterInCombat.value) {
    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0 })
    saveCombatMonsters()
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
    store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0 })
    saveCombatMonsters()
    // Add blinking effect
    const listItem = event.currentTarget
    listItem.classList.add('blink')
    setTimeout(() => {
      listItem.classList.remove('blink')
    }, 1000)
  }
}
</script>

<template>
  <div class="monster-container container">
    <div class="header">
      <h1>{{ header }}</h1>
      <button v-if="!editing" @click="doEdit(true)">Add Monster</button>
      <button v-else @click="doEdit(false)">Cancel</button>
    </div>
    <form class="add-monsters-form" v-if="editing" @submit.prevent="saveMonster">
      <input v-model.trim="newMonster" type="text" placeholder="Monster Name">
      <input v-model.number="newMonsterHP" type="number" placeholder="Hit Points">
      <input v-model.number="newMonsterCR" type="number" step="any" placeholder="Challenge Rating">
      <label for="newMonster">
        <input v-model="newMonsterInCombat" type="checkbox"> Add to Combat
      </label>
      <button :disabled="newMonster.length < 1 || newMonsterHP <= 0 || !newMonsterCR" class="btn btn-primary">
        Save
      </button>
    </form>
    <h3 class="monster-list-header">
      <span>Name</span>
      <span>CR</span>
      <span>HP</span>
    </h3>
    <ul>
      <li v-for="(monster, index) in monsters" @click="toggleInCombat(monster, $event)" :key="monster.id">
        <span>{{ monster.label }}</span>
        <span>{{ monster.challengeRating }}</span>
        <span>{{ monster.hitPoints }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Add the blink effect */
.blink {
  animation: blink-animation 1s;
}


/* Other styles */
h1 {
  position: relative;
  border-bottom: solid 1px #292929;
  margin-bottom: 10px;
}
h3 {
  position: relative;
  border-bottom: 2px solid #ccc;
}

ul {
  list-style: none;
  padding: 0;
}

.monster-list-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Monster name*/
.monster-list-header span:first-child {
  flex-grow: 2; 
  text-align: left;
}

/*CR*/
.monster-list-header span:nth-child(2) {
  flex-grow: 1;
  margin-left: auto; 
  padding-left: 1rem;
  text-align: center;
}
/*HP*/
.monster-list-header span:last-child {
  flex-grow: 1;
  text-align: right;
}

li {
  display: flex;
  justify-content: space-between;
}

li span {
  flex: 1;
  text-align: center;
}

/* Monster name*/
li span:first-child {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 2;
}

/*CR*/
li span:nth-child(2) {
  flex-grow: 1;
  margin-left: 1rem;
}
/*HP*/
li span:last-child {
  text-align: right;
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
}

@media (min-width: 1024px) {
  .monster-container {
    padding: 2rem;
  }
}
</style>