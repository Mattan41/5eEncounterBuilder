<script setup>
import { ref, watch } from 'vue'
import { getOpen5e } from '../api/open5e.js'

const props = defineProps({
  show: Boolean,
  creature: Object
})

const emit = defineEmits(['close'])

const creatureDetails = ref(null)
const loading = ref(false)
const error = ref(null)

// Helper to build a slug from a name (fallback when API key lookup fails)
const createSlugFromName = (name) => {
  return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')      // Remove special characters
      .replace(/[\s_]+/g, '-')       // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Remove duplicate hyphens
      .replace(/^-+|-+$/g, '')       // Strip leading/trailing hyphens
      .trim()
}

// Normalize v2 API response to match template field expectations
const normalizeV2Creature = (v2) => {
  const abilityScores = v2.ability_scores || {}
  const allActions = v2.actions || []
  const ri = v2.resistances_and_immunities || {}

  const sensesParts = []
  if (v2.darkvision_range) sensesParts.push(`darkvision ${v2.darkvision_range} ft.`)
  if (v2.blindsight_range) sensesParts.push(`blindsight ${v2.blindsight_range} ft.`)
  if (v2.tremorsense_range) sensesParts.push(`tremorsense ${v2.tremorsense_range} ft.`)
  if (v2.truesight_range) sensesParts.push(`truesight ${v2.truesight_range} ft.`)

  const savingThrows = v2.saving_throws || {}
  const savingThrowsStr = Object.entries(savingThrows)
    .filter(([, val]) => val !== 0)
    .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)} ${val >= 0 ? '+' : ''}${val}`)
    .join(', ')

  return {
    ...v2,
    slug: v2.key,
    type: typeof v2.type === 'object' ? (v2.type?.name || 'Unknown') : v2.type,
    subtype: v2.subcategory || v2.subtype || '',
    strength:     abilityScores.strength     ?? v2.strength,
    dexterity:    abilityScores.dexterity    ?? v2.dexterity,
    constitution: abilityScores.constitution ?? v2.constitution,
    intelligence: abilityScores.intelligence ?? v2.intelligence,
    wisdom:       abilityScores.wisdom       ?? v2.wisdom,
    charisma:     abilityScores.charisma     ?? v2.charisma,
    special_abilities: v2.traits || [],
    actions:           allActions.filter(a => a.action_type === 'ACTION'),
    legendary_actions: allActions.filter(a => a.action_type === 'LEGENDARY_ACTION'),
    reactions:         allActions.filter(a => a.action_type === 'REACTION'),
    armor_desc:        v2.armor_detail || v2.armor_desc || '',
    document__title:   v2.document?.name || v2.document__title || '',
    senses:            sensesParts.join(', ') || v2.senses || '',
    saving_throws:     savingThrowsStr || '',
    skills:            v2.skill_bonuses || v2.skills || null,
    damage_resistances:   ri.damage_resistances_display  || v2.damage_resistances  || '',
    damage_immunities:    ri.damage_immunities_display   || v2.damage_immunities   || '',
    condition_immunities: ri.condition_immunities_display || v2.condition_immunities || '',
  }
}

// Helper to find a creature's API key by name
const findKeyViaAPI = async (name) => {
  try {
    const data = await getOpen5e('/creatures/', { name__icontains: name, limit: 5 })

    if (data.results && data.results.length > 0) {
      // Prefer exact match, fall back to first result
      const exactMatch = data.results.find(m =>
          m.name.toLowerCase() === name.toLowerCase()
      )

      const foundMonster = exactMatch || data.results[0]
      return foundMonster.key
    }
  } catch (error) {
    // Ignore error, fall back to slug derived from name
  }

  return createSlugFromName(name)
}

// Main function to fetch creature details
const fetchCreatureDetails = async (creature) => {
  if (!creature) return

  loading.value = true
  error.value = null

  try {
    // 🎨 CUSTOM MONSTER: Use data directly from props
    if (creature.isCustom || creature.source === 'custom') {
      creatureDetails.value = {
        ...creature,
        // Ensure all UI fields are present
        desc: creature.desc || creature.description || 'Custom monster - no description available',
        actions: creature.actions || [],
        special_abilities: creature.special_abilities || ['Custom monster - no special abilities available','Nada zipp'],
        speed: creature.speed || { walk: 30 },
        armor_class: creature.armor_class || 10,
        hit_points: creature.hit_points || 10,
        challenge_rating: creature.challenge_rating || 0,
        strength: creature.strength || 10,
        dexterity: creature.dexterity || 10,
        constitution: creature.constitution || 10,
        intelligence: creature.intelligence || 10,
        wisdom: creature.wisdom || 10,
        charisma: creature.charisma || 10,
        size: creature.size || 'Medium',
        type: creature.type || 'Humanoid',
        alignment: creature.alignment || 'Unknown'
      }

      loading.value = false
      return
    }

    // 🌐 API MONSTER: Fetch from Open5e
    let key = creature.key || creature.slug

    // If key is missing, look it up via API
    if (!key && creature.name) {
      key = await findKeyViaAPI(creature.name)
    }

    if (!key) {
      throw new Error('Could not determine key for creature')
    }

    const data = await getOpen5e(`/creatures/${key}/`)

    // Mark as API monster and normalize v2 fields
    creatureDetails.value = {
      ...normalizeV2Creature(data),
      source: 'open5e'
    }

  } catch (err) {
    error.value = `Failed to load creature details: ${err.message}`
  } finally {
    loading.value = false
  }
}

// Watch for creature changes
watch(() => props.creature, (newCreature) => {
  if (newCreature && props.show) {
    fetchCreatureDetails(newCreature)
  }
}, { immediate: true })

// Watch for modal open/close
watch(() => props.show, (show) => {
  if (show && props.creature) {
    fetchCreatureDetails(props.creature)
  }
})

// Event handlers
const closeModal = () => {
  emit('close')
}

// Helper functions
const getAbilityModifier = (score) => {
  const modifier = Math.floor((score - 10) / 2)
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

const formatSpeed = (speed) => {
  if (typeof speed === 'object' && speed) {
    return Object.entries(speed)
        .map(([type, value]) => `${type} ${value} ft.`)
        .join(', ')
  }
  return speed || '30 ft.'
}

const getChallengeRatingDisplay = (cr) => {
  if (cr === 0) return '0'
  if (cr < 1) {
    // Hantera fractional CR (0.125, 0.25, 0.5)
    if (cr === 0.125) return '1/8'
    if (cr === 0.25) return '1/4'
    if (cr === 0.5) return '1/2'
  }
  return cr.toString()
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="creature-modal" @click.stop>
      <!-- Close button -->
      <button class="close-btn" @click="closeModal">×</button>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading creature details...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <h3>❌ Error Loading Creature</h3>
        <p>{{ error }}</p>

        <!-- Fallback: visa basic info om vi har den -->
        <div v-if="props.creature" class="fallback-info">
          <h4>Available Information:</h4>
          <p><strong>Name:</strong> {{ props.creature.name || 'Unknown' }}</p>
          <p><strong>Type:</strong> {{ props.creature.type || 'Unknown' }}</p>
          <p><strong>Source:</strong> {{ props.creature.source || props.creature.isCustom ? 'Custom' : 'API' }}</p>
        </div>

        <button @click="closeModal" class="error-btn">Close</button>
      </div>

      <!-- Success state -->
      <div v-else-if="creatureDetails" class="creature-content">
        <div class="creature-header">
          <h2>
            {{ creatureDetails.name }}
            <span v-if="creatureDetails.isCustom || creatureDetails.source === 'custom'" class="custom-badge">Custom</span>
            <span v-else-if="creatureDetails.source === 'open5e'" class="api-badge">{{ creatureDetails.source }}</span>
            <span v-if="creatureDetails.source === 'open5e'" class="source-badge">{{ creatureDetails.document__title }}</span>
          </h2>
          <p class="creature-subtitle">
            {{ creatureDetails.size }} {{ creatureDetails.type }}
            <span v-if="creatureDetails.subtype">({{ creatureDetails.subtype }})</span>,
            {{ creatureDetails.alignment }}
          </p>
        </div>

        <!-- Basic stats -->
        <div class="basic-stats">
          <div class="stat-block">
            <strong>Armor Class</strong> {{ creatureDetails.armor_class }}
            <span v-if="creatureDetails.armor_desc">({{ creatureDetails.armor_desc }})</span>
          </div>
          <div class="stat-block">
            <strong>Hit Points</strong> {{ creatureDetails.hit_points }}
            <span v-if="creatureDetails.hit_dice">({{ creatureDetails.hit_dice }})</span>
          </div>
          <div class="stat-block">
            <strong>Speed</strong> {{ formatSpeed(creatureDetails.speed) }}
          </div>
          <div class="stat-block">
            <strong>Challenge Rating</strong> {{ getChallengeRatingDisplay(creatureDetails.challenge_rating) }}
          </div>
        </div>

        <!-- Abilities -->
        <div class="abilities-stats">
          <h3>Ability Scores</h3>
          <div class="abilities-grid">
            <div class="ability">
              <div class="ability-name">STR</div>
              <div class="ability-score">{{ creatureDetails.strength }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.strength) }}</div>
            </div>
            <div class="ability">
              <div class="ability-name">DEX</div>
              <div class="ability-score">{{ creatureDetails.dexterity }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.dexterity) }}</div>
            </div>
            <div class="ability">
              <div class="ability-name">CON</div>
              <div class="ability-score">{{ creatureDetails.constitution }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.constitution) }}</div>
            </div>
            <div class="ability">
              <div class="ability-name">INT</div>
              <div class="ability-score">{{ creatureDetails.intelligence }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.intelligence) }}</div>
            </div>
            <div class="ability">
              <div class="ability-name">WIS</div>
              <div class="ability-score">{{ creatureDetails.wisdom }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.wisdom) }}</div>
            </div>
            <div class="ability">
              <div class="ability-name">CHA</div>
              <div class="ability-score">{{ creatureDetails.charisma }}</div>
              <div class="ability-modifier">{{ getAbilityModifier(creatureDetails.charisma) }}</div>
            </div>
          </div>
        </div>

        <!-- Additional Stats (if available) -->
        <div v-if="creatureDetails.saving_throws || creatureDetails.skills || creatureDetails.damage_resistances" class="additional-stats">
          <div v-if="creatureDetails.saving_throws" class="stat-block">
            <strong>Saving Throws</strong> {{ creatureDetails.saving_throws }}
          </div>
          <div v-if="creatureDetails.skills" class="stat-block">
            <strong>Skills</strong> {{ typeof creatureDetails.skills === 'object' ? Object.entries(creatureDetails.skills).map(([k,v]) => `${k} +${v}`).join(', ') : creatureDetails.skills }}
          </div>
          <div v-if="creatureDetails.damage_resistances" class="stat-block">
            <strong>Damage Resistances</strong> {{ creatureDetails.damage_resistances }}
          </div>
          <div v-if="creatureDetails.damage_immunities" class="stat-block">
            <strong>Damage Immunities</strong> {{ creatureDetails.damage_immunities }}
          </div>
          <div v-if="creatureDetails.condition_immunities" class="stat-block">
            <strong>Condition Immunities</strong> {{ creatureDetails.condition_immunities }}
          </div>
          <div v-if="creatureDetails.senses" class="stat-block">
            <strong>Senses</strong> {{ creatureDetails.senses }}
          </div>
          <div v-if="creatureDetails.languages" class="stat-block">
            <strong>Languages</strong> {{ creatureDetails.languages }}
          </div>
        </div>

        <!-- Description -->
        <div v-if="creatureDetails.desc" class="description-section">
          <h3>Description</h3>
          <div class="description" v-html="creatureDetails.desc"></div>
        </div>

        <!-- Special Abilities -->
        <div v-if="creatureDetails.special_abilities && creatureDetails.special_abilities.length" class="special-abilities-section">
          <h3>Special Abilities</h3>
          <div v-for="ability in creatureDetails.special_abilities" :key="ability.name" class="ability-block">
            <h4>{{ ability.name }}</h4>
            <p v-html="ability.desc"></p>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="creatureDetails.actions && creatureDetails.actions.length" class="actions-section">
          <h3>Actions</h3>
          <div v-for="action in creatureDetails.actions" :key="action.name" class="action-block">
            <h4>{{ action.name }}</h4>
            <p v-html="action.desc"></p>
          </div>
        </div>

        <!-- Legendary Actions -->
        <div v-if="creatureDetails.legendary_actions && creatureDetails.legendary_actions.length" class="legendary-actions-section">
          <h3>Legendary Actions</h3>
          <div v-for="action in creatureDetails.legendary_actions" :key="action.name" class="action-block">
            <h4>{{ action.name }}</h4>
            <p v-html="action.desc"></p>
          </div>
        </div>

        <!-- Reactions -->
        <div v-if="creatureDetails.reactions && creatureDetails.reactions.length" class="reactions-section">
          <h3>Reactions</h3>
          <div v-for="reaction in creatureDetails.reactions" :key="reaction.name" class="action-block">
            <h4>{{ reaction.name }}</h4>
            <p v-html="reaction.desc"></p>
          </div>
        </div>
      </div>

      <!-- No data state -->
      <div v-else class="no-data-state">
        <p>No creature data available</p>
        <button @click="closeModal" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal content */
.creature-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 100%);
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.creature-content {
  padding: 2rem;
}

/* Close button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Header */
.creature-header h2 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.creature-subtitle {
  color: #ccc;
  margin: 0;
  font-style: italic;
}

/* Badges */
.custom-badge {
  background: #9333ea;
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: normal;
}

.api-badge {
  background: #059669;
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: normal;
}

.source-badge {
  background: linear-gradient(135deg, #ff7e00, #ffb300);
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: normal;
}

/* Stats sections */
.basic-stats, .additional-stats {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-block {
  margin: 0.5rem 0;
  color: #fff;
}

.stat-block strong {
  color: #ffd700;
  margin-right: 0.5rem;
}

/* Abilities grid */
.abilities-stats {
  margin: 1.5rem 0;
}

.abilities-stats h3 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.ability {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.8rem 0.5rem;
}

.ability-name {
  font-weight: bold;
  color: #ffd700;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.ability-score {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.2rem;
}

.ability-modifier {
  font-size: 0.9rem;
  color: #ccc;
  font-style: italic;
}

/* Content sections */
.description-section,
.special-abilities-section,
.actions-section,
.legendary-actions-section,
.reactions-section {
  margin: 2rem 0;
}

.description-section h3,
.special-abilities-section h3,
.actions-section h3,
.legendary-actions-section h3,
.reactions-section h3 {
  color: #ffd700;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ffd700;
}

.description {
  color: #ccc;
  line-height: 1.6;
}

.ability-block,
.action-block {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #ffd700;
}

.ability-block h4,
.action-block h4 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.ability-block p,
.action-block p {
  color: #ccc;
  margin: 0;
  line-height: 1.5;
}

/* Loading state */
.loading-state {
  padding: 2rem;
  text-align: center;
  color: white;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid #ffd700;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-state {
  padding: 2rem;
  text-align: center;
  color: white;
}

.error-state h3 {
  color: #ff6b6b;
  margin: 0 0 1rem 0;
}

.fallback-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
}

.error-btn, .close-button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.error-btn:hover, .close-button:hover {
  background: #ff6666;
}

/* No data state */
.no-data-state {
  padding: 2rem;
  text-align: center;
  color: #ccc;
}

/* Responsive design */
@media (max-width: 768px) {
  .creature-modal {
    margin: 1rem;
    max-height: 95vh;
  }

  .creature-content {
    padding: 1rem;
  }

  .abilities-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .creature-header h2 {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .abilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
