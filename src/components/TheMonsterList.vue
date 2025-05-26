<script setup>
      import { ref } from 'vue'
      import { saveCombatMonsters, store } from '../store.js'

      const monsters = ref([])
      const header = ref('Monster List')
      const editing = ref(false)
      const searchQuery = ref('') // Nytt sökfält
      const newMonster = ref("")
      const newMonsterHP = ref(0)
      const newMonsterCR = ref("0")
      const newMonsterInCombat = ref(false)

      // Funktion för att söka efter monster
      const searchMonsters = async () => {
        try {
          const response = await fetch(`https://api.open5e.com/v1/monsters/?search=${searchQuery.value}`)
          const data = await response.json()
          monsters.value = data.results.map((monster, index) => ({
            id: monsters.value.length + index + 1,
            label: monster.name,
            challengeRating: parseFloat(monster.challenge_rating),
            hitPoints: monster.hit_points,
            originalHitPoints: monster.hit_points,
          }))
        } catch (error) {
          console.log('Error fetching monsters', error)
        }
      }

      // Funktion för att spara nya monster
      const saveMonster = () => {
        const monster = {
          id: monsters.value.length + 1,
          label: newMonster.value,
          challengeRating: parseFloat(newMonsterCR.value),
          hitPoints: newMonsterHP.value,
          originalHitPoints: newMonsterHP.value,
        }
        monsters.value.push(monster)
        if (newMonsterInCombat.value) {
          store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
          saveCombatMonsters()
        }
        newMonster.value = ""
        newMonsterHP.value = null
        newMonsterCR.value = ""
        newMonsterInCombat.value = false
      }

      // Lägg till monster i combat-listan
      const addToCombatList = (monster, event) => {
        event.preventDefault()
        if (event.type === 'click') {
          store.combatMonsters.push({ ...monster, combatId: Date.now(), initiative: 0, done: false })
          saveCombatMonsters()
          const listItem = event.currentTarget
          listItem.classList.add('blink')
          setTimeout(() => {
            listItem.classList.remove('blink')
          }, 1000)
        }
      }

      const doEdit = (e) => {
        editing.value = e
        newMonster.value = ""
        newMonsterHP.value = null
        newMonsterCR.value = ""
        newMonsterInCombat.value = false
      }
      </script>

      <template>
        <div class="monster-container container">
          <div class="header">
            <h1>{{ header }}</h1>
            <button v-if="!editing" @click="doEdit(true)">Add Monster</button>
            <button v-else @click="doEdit(false)">Cancel</button>
          </div>
          <form class="search-form" @submit.prevent="searchMonsters">
            <input v-model="searchQuery" type="text" placeholder="Search for monsters">
            <button :disabled="!searchQuery" class="btn btn-primary">Search</button>
          </form>
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
            <li v-for="(monster, index) in monsters" @click="addToCombatList(monster, $event)" :key="monster.id">
              <span>{{ monster.label }}</span>
              <span>{{ monster.challengeRating }}</span>
              <span>{{ monster.hitPoints }}</span>
            </li>
          </ul>
        </div>
      </template>

      <style scoped>
      /* Stil för sökformuläret */
      .search-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .search-form input {
        padding: 0.5rem;
        border-radius: 5px;
        border: 1px solid #555;
        background-color: #444;
        color: white;
      }
      </style>