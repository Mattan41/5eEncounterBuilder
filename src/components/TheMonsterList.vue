<script setup>
import {ref, onMounted} from 'vue'
import {store} from '../assets/store'

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
  newMonsterHP.value = 0
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
const togglePriority = (monster, event) => {
  event.preventDefault()
  if (event.type === 'click') {
    if (monster.count === 0) {
      monster.inCombat = true
    }
    store.combatMonsters.push({ ...monster, combatId: Date.now() })
    monster.count++
  } else if (event.type === 'contextmenu') {
    const index = store.combatMonsters.findIndex(m => m.combatId === monster.combatId)
    if (index !== -1) {
      store.combatMonsters.splice(index, 1)
      monster.count--
      if (monster.count === 0) {
        monster.inCombat = false
      }
    }
  }
}

onMounted(async () => {
  try {
    const response = await fetch('https://api.open5e.com/v1/monsters/?page=2')
    const data = await response.json()
    store.monsters = data.results.slice(0, 10).map((monster, index) => ({
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
      <li v-for="(monster, index) in store.monsters" @click="togglePriority(monster, $event)"
          @contextmenu="togglePriority(monster, $event)" :key="monster.id" class="static-class"
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

h3, li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid #ccc;
}

h3, li span {
  flex: 1;
  text-align: center;
}

h3, li span:first-child {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h3, li span:last-child {
  text-align: right;
}

.monster-container {
  padding: 1rem;
  border-radius: 8px;
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