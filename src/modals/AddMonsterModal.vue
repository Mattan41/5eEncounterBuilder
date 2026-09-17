<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useCombat } from '@/composables/useCombat.js'
import { formatCR } from '@/utils/formatCR.js'

const { addToFavorites } = useFavorites()
const { addToCombat } = useCombat()

defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

// Form data for custom monsters
const newMonster = ref('')
const newMonsterHP = ref(0)
const newMonsterCR = ref('0')
const newMonsterInCombat = ref(false)

// Additional fields for richer custom monsters
const newMonsterType = ref('Humanoid')
const newMonsterSize = ref('Medium')
const newMonsterAC = ref(10)
const newMonsterAlignment = ref('Neutral')
const newMonsterDescription = ref('')

const specialAbilities = ref(['']) // Reactive array for special abilities

const addAbility = () => {
  specialAbilities.value.push('') // Add an empty entry for a new ability
}

const removeAbility = (index) => {
  specialAbilities.value.splice(index, 1) // Remove the ability at the given index
}

const updateAbility = (index, value) => {
  specialAbilities.value[index] = value // Update the specific special ability
}
// Ability scores
const abilities = ref({
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
})

const clearForm = () => {
  newMonster.value = ''
  newMonsterHP.value = 1
  newMonsterCR.value = '0'
  newMonsterInCombat.value = false

  // Reset additional fields
  newMonsterType.value = 'Humanoid'
  newMonsterSize.value = 'Medium'
  newMonsterAC.value = 10
  newMonsterAlignment.value = 'Neutral'
  newMonsterDescription.value = ''

  // Reset abilities
  abilities.value = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  }
}

const saveMonster = () => {
  const challengeRating = parseFloat(newMonsterCR.value)
  const customMonster = {
    name: newMonster.value,
    type: newMonsterType.value,
    size: newMonsterSize.value,
    alignment: newMonsterAlignment.value,
    armor_class: newMonsterAC.value,
    hit_points: newMonsterHP.value,
    challenge_rating: challengeRating,
    strength: abilities.value.strength,
    dexterity: abilities.value.dexterity,
    constitution: abilities.value.constitution,
    intelligence: abilities.value.intelligence,
    wisdom: abilities.value.wisdom,
    charisma: abilities.value.charisma,
    desc:
      newMonsterDescription.value ||
      `A custom ${newMonsterSize.value.toLowerCase()} ${newMonsterType.value.toLowerCase()}.`,
    actions: [],
    special_abilities: specialAbilities.value.map((ability) => ability.trim()).filter(Boolean),
    isCustom: true,
    source: 'custom',
    label: newMonster.value,
    challengeRating,
    challengeRatingDisplay: formatCR(challengeRating),
    hitPoints: newMonsterHP.value,
    originalHitPoints: newMonsterHP.value,
    armorClass: newMonsterAC.value,
    document: 'Custom',
  }

  // Add to favorites
  addToFavorites(customMonster)

  // Add to combat if selected
  if (newMonsterInCombat.value) {
    addToCombat(customMonster)
  }

  clearForm()
  closeModal()
}

const closeModal = () => {
  clearForm()
  emit('close')
}

// Helper function for ability modifier
const getAbilityModifier = (score) => {
  const modifier = Math.floor((score - 10) / 2)
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}
</script>

<template>
  <BaseModal :show="isOpen" title="Add Custom Monster" @close="closeModal">
    <form class="modal-form" @submit.prevent="saveMonster">
      <!-- Basic Info -->
      <div class="form-section">
        <h3>Basic Information</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="monster-name">Monster Name</label>
            <input
              id="monster-name"
              v-model.trim="newMonster"
              type="text"
              placeholder="Enter monster name"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="monster-type">Type</label>
            <select id="monster-type" v-model="newMonsterType">
              <option value="Aberration">Aberration</option>
              <option value="Beast">Beast</option>
              <option value="Celestial">Celestial</option>
              <option value="Construct">Construct</option>
              <option value="Dragon">Dragon</option>
              <option value="Elemental">Elemental</option>
              <option value="Fey">Fey</option>
              <option value="Fiend">Fiend</option>
              <option value="Giant">Giant</option>
              <option value="Humanoid">Humanoid</option>
              <option value="Monstrosity">Monstrosity</option>
              <option value="Ooze">Ooze</option>
              <option value="Plant">Plant</option>
              <option value="Undead">Undead</option>
            </select>
          </div>

          <div class="form-group">
            <label for="monster-size">Size</label>
            <select id="monster-size" v-model="newMonsterSize">
              <option value="Tiny">Tiny</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Huge">Huge</option>
              <option value="Gargantuan">Gargantuan</option>
            </select>
          </div>

          <div class="form-group">
            <label for="monster-alignment">Alignment</label>
            <select id="monster-alignment" v-model="newMonsterAlignment">
              <option value="Lawful Good">Lawful Good</option>
              <option value="Neutral Good">Neutral Good</option>
              <option value="Chaotic Good">Chaotic Good</option>
              <option value="Lawful Neutral">Lawful Neutral</option>
              <option value="Neutral">Neutral</option>
              <option value="Chaotic Neutral">Chaotic Neutral</option>
              <option value="Lawful Evil">Lawful Evil</option>
              <option value="Neutral Evil">Neutral Evil</option>
              <option value="Chaotic Evil">Chaotic Evil</option>
              <option value="Unaligned">Unaligned</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Combat Stats -->
      <div class="form-section">
        <h3>Combat Statistics</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="monster-hp">Hit Points</label>
            <input
              id="monster-hp"
              v-model.number="newMonsterHP"
              type="number"
              placeholder="Enter hit points"
              min="1"
              max="1000"
              required
            />
          </div>

          <div class="form-group">
            <label for="monster-ac">Armor Class</label>
            <input
              id="monster-ac"
              v-model.number="newMonsterAC"
              type="number"
              placeholder="Enter AC"
              min="1"
              max="30"
              required
            />
          </div>

          <div class="form-group">
            <label for="monster-cr">Challenge Rating</label>
            <select id="monster-cr" v-model="newMonsterCR" required>
              <option value="0">0</option>
              <option value="0.125">1/8</option>
              <option value="0.25">1/4</option>
              <option value="0.5">1/2</option>
              <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Ability Scores -->
      <div class="form-section">
        <h3>Ability Scores</h3>
        <div class="abilities-grid">
          <div v-for="(value, ability) in abilities" :key="ability" class="ability-input">
            <label :for="`ability-${ability}`">
              {{ ability.charAt(0).toUpperCase() + ability.slice(1) }}
            </label>
            <input
              :id="`ability-${ability}`"
              v-model.number="abilities[ability]"
              type="number"
              min="1"
              max="30"
              required
            />
            <small class="ability-modifier">
              {{ getAbilityModifier(abilities[ability]) }}
            </small>
          </div>
        </div>
      </div>

      <!-- special_abilities -->
      <!--        <div class="form-section">-->
      <!--          <h3>Special Abilities (Optional)</h3>-->
      <!--          <div class="form-group">-->
      <!--            <label for="monster-special-abilities">Special Abilities</label>-->
      <!--            <textarea-->
      <!--                id="monster-special-abilities"-->
      <!--                v-model="newMonsterSpecialAbilities"-->
      <!--                placeholder="List special abilities, one per line..."-->
      <!--                rows="4"-->
      <!--            ></textarea>-->
      <!--          </div>-->
      <!--        </div>-->

      <div class="form-section">
        <h3>Special Abilities</h3>
        <div v-for="(ability, index) in specialAbilities" :key="index" class="ability-input">
          <input
            :value="ability"
            @input="updateAbility(index, $event.target.value)"
            placeholder="Ability Name"
          />
          <BaseButton variant="danger" size="sm" @click="removeAbility(index)">Remove</BaseButton>
        </div>
        <BaseButton variant="secondary" @click="addAbility">Add Special Ability</BaseButton>
      </div>

      <!-- Description -->
      <div class="form-section">
        <h3>Description (Optional)</h3>
        <div class="form-group">
          <label for="monster-description">Description</label>
          <textarea
            id="monster-description"
            v-model="newMonsterDescription"
            placeholder="Describe your custom monster..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- Options -->
      <div class="form-section">
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="newMonsterInCombat" type="checkbox" />
            <span class="checkmark"></span>
            Add to Combat immediately
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="!newMonster || newMonsterHP <= 0">
          Save Monster
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
/* The modal shell (backdrop, header, close button) is shared via BaseModal
   and components.css. */
.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border-bottom: 1px solid #444;
  padding-bottom: 1.5rem;
}

.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: var(--gold);
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .form-row {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
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
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--amber);
  box-shadow: 0 0 0 2px rgba(255, 145, 0, 0.2);
}

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.ability-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.ability-input label {
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--gold);
  margin-bottom: 0.3rem;
}

.ability-input input {
  width: 60px;
  text-align: center;
  margin-bottom: 0.2rem;
}

.ability-modifier {
  font-size: 0.8rem;
  color: #ccc;
  font-style: italic;
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

.checkbox-label input[type='checkbox'] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

@media (max-width: 600px) {
  .modal-form {
    padding: 1rem;
  }

  .abilities-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
