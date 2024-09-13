<script setup>
import { ref, onMounted } from 'vue'
import { store } from '../assets/store'

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
const newMonsterInCombat = ref(false)

const saveMonster = () => {
  const monster = {
    id: store.monsters.length + 1,
    label: newMonster.value,
    done: false,
    inCombat: newMonsterInCombat.value
  }
  store.monsters.push(monster)
  if (newMonsterInCombat.value) {
    store.combatMonsters.push(monster)
  }
  newMonster.value = ""
  newMonsterInCombat.value = false
}

const doEdit = (e) => {
  editing.value = e
  newMonster.value = ""
  newMonsterInCombat.value = false
}

const toggleDone = (monster) => {
  monster.done = !monster.done
}

//push/remove monster on combatList
const togglePriority = (monster, event) => {
  event.preventDefault()
  monster.inCombat = !monster.inCombat
  if (monster.inCombat) {
    store.combatMonsters.push(monster)
  } else {
    const index = store.combatMonsters.findIndex(m => m.id === monster.id)
    if (index !== -1) {
      store.combatMonsters.splice(index, 1)
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
      done: false,
      inCombat: false
    }))
  } catch (error) {
    console.log('Error fetching monsters', error)
  }
})
</script>

<template>
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
    <input v-model.trim="newMonster" type="text" placeholder="add monster">
    <label for="newMonster">
      <input type="checkbox" v-model="newMonsterInCombat">
      Active in combat
    </label>
    <button :disabled="newMonster.length < 5" class="btn btn-primary">
      Save monster
    </button>
  </form>
  <ul>
    <li v-for="(monster, index) in store.monsters" @click="toggleDone(monster)" @contextmenu="togglePriority(monster, $event)" :key="monster.id" class="static-class" :class="{
      strikeout: monster.done,
      priority: monster.inCombat
    }">
      {{ monster.label }}
    </li>
  </ul>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.strikeout {
  text-decoration: line-through;
}
.priority {
  color: #ff9100;
}
</style>
