<script setup>
import { ref, onMounted } from 'vue'

// props
defineProps({
  addMonsterButton: {
    type: String,
    default: 'add monsters'
  }
});

const header = ref('Monster List')
const editing = ref(false)
const monsters = ref([])
const newMonster = ref("")
const newMonsterInCombat = ref(false)

const saveMonster = () => {
  monsters.value.push({
    id: monsters.value.length + 1,
    label: newMonster.value,
    done: false,
    inCombat: newMonsterInCombat.value
  })
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

const togglePriority = (monster, event) => {
  event.preventDefault()
  monster.inCombat = !monster.inCombat
}

// hämta 10 monster ifrån open%e.com
onMounted(async () => {
  try {
    const response = await fetch('https://api.open5e.com/v1/monsters/?page=2')
    const data = await response.json()
    monsters.value = data.results.slice(0,10).map((monster, index) => ({
      id: monsters.value.length + index + 1,
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
    <li v-for="(monster, index) in monsters" @click="toggleDone(monster)" @contextmenu="togglePriority(monster, $event)" :key="monster.id" class="static-class" :class="{
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

h3 {
  font-size: 1.2rem;
}

.header h1,
.header h3 {
  text-align: center;
}

.strikeout {
  text-decoration: line-through;
}
.priority {
  color: #ff9100;
}

@media (min-width: 1024px) {
  .header h1,
  .header h3 {
    text-align: left;
  }
}
</style>
