<script setup>
import { ref } from 'vue'
import { addToFavorites, store, saveCombatMonsters } from '../store.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const newMonster = ref("")
const newMonsterHP = ref(0)
const newMonsterCR = ref("0")
const newMonsterInCombat = ref(false)

const clearForm = () => {
  newMonster.value = ""
  newMonsterHP.value = 0
  newMonsterCR.value = "0"
  newMonsterInCombat.value = false
}

const saveMonster = () => {
  const monster = {
    id: `custom_${Date.now()}`,
    label: newMonster.value,
    challengeRating: parseFloat(newMonsterCR.value),
    hitPoints: newMonsterHP.value,
    originalHitPoints: newMonsterHP.value,
    type: 'Custom',
    size: 'Medium',
    armorClass: 10,
    document: 'Custom'
  }

  addToFavorites(monster)

  if (newMonsterInCombat.value) {
    store.combatMonsters.push({
      ...monster,
      combatId: Date.now(),
      initiative: 0,
      done: false
    })
    saveCombatMonsters()
  }

  clearForm()
  closeModal()
}

const closeModal = () => {
  clearForm()
  emit('close')
}

const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add Custom Monster</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <form class="modal-form" @submit.prevent="saveMonster">
        <div class="form-group">
          <label for="monster-name">Monster Name</label>
          <input
              id="monster-name"
              v-model.trim="newMonster"
              type="text"
              placeholder="Enter monster name"
              required
          >
        </div>

        <div class="form-group">
          <label for="monster-hp">Hit Points</label>
          <input
              id="monster-hp"
              v-model.number="newMonsterHP"
              type="number"
              placeholder="Enter hit points"
              min="1"
              required
          >
        </div>

        <div class="form-group">
          <label for="monster-cr">Challenge Rating</label>
          <select id="monster-cr" v-model="newMonsterCR" required>
            <option value="0">0</option>
            <option value="0.125">1/8</option>
            <option value="0.25">1/4</option>
            <option value="0.5">1/2</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
            <option value="25">25</option>
            <option value="26">26</option>
            <option value="27">27</option>
            <option value="28">28</option>
            <option value="29">29</option>
            <option value="30">30</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="newMonsterInCombat" type="checkbox">
            <span class="checkmark"></span>
            Add to Combat immediately
          </label>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
              type="submit"
              :disabled="!newMonster || newMonsterHP <= 0"
              class="btn btn-primary"
          >
            Save Monster
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #444;
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #ddd;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

.checkbox-group {
  margin: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #357abd;
}

.btn-primary:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-secondary:hover {
  background: #777;
}

@media (max-width: 600px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
