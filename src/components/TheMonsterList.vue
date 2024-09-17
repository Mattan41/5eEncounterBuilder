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
    store.combatMonsters.push(JSON.parse(JSON.stringify(monster)))
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
    store.combatMonsters.push(monster)
    monster.count++
  } else if (event.type === 'contextmenu') {
    const index = store.combatMonsters.indexOf(monster)
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
    <div class="monster-list-header">
      <span>Name</span>
      <span>CR</span>
      <span>HP</span>
    </div>
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
}

ul {
  list-style: none;
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

li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

li span {
  flex: 1;
  text-align: center;
}

li span:first-child {
  text-align: left;
}

li span:last-child {
  text-align: right;
}
</style>
