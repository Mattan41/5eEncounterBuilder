<script setup>
import { computed, ref } from 'vue'
import { IMPORT_MODES, isDestructiveImportMode, useAppState } from '@/composables/useAppState.js'
import AboutModal from '@/modals/AboutModal.vue'

defineProps({
  showMonsterList: {
    type: Boolean,
    required: true,
  },
  showFavoriteList: {
    type: Boolean,
    required: true,
  },
  showCombatEncounter: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['toggle-monster-list', 'toggle-favorite-list', 'toggle-combat-encounter'])

const {
  exportState,
  readImportFile,
  applyImportedState,
  importError,
  importMessage,
  pendingState,
} = useAppState()

// Import choices, ordered from safest to most destructive.
const importModes = [
  {
    value: IMPORT_MODES.MERGE_FAVORITES_ONLY,
    label: 'Merge favorites only',
    description: 'Keep my current combat list and round untouched',
  },
  {
    value: IMPORT_MODES.MERGE_FAVORITES_REPLACE_REST,
    label: 'Merge favorites, replace the rest',
    description: "Take the save file's combat list and round, keep my library",
  },
  {
    value: IMPORT_MODES.REPLACE_ALL,
    label: 'Replace everything',
    description: 'Discard my current state and use the save file',
  },
]

const fileInput = ref(null)
const showImportModal = ref(false)
const showAbout = ref(false)
const selectedMode = ref(IMPORT_MODES.MERGE_FAVORITES_ONLY)

const favoriteCount = computed(() => pendingState.value?.favoriteMonsters?.length || 0)
const combatCount = computed(() => pendingState.value?.combatMonsters?.length || 0)
const importRound = computed(() => pendingState.value?.currentRound ?? 1)

const triggerImport = () => {
  importError.value = ''
  importMessage.value = ''
  fileInput.value?.click()
}

const onFileSelected = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  if (await readImportFile(file)) {
    selectedMode.value = IMPORT_MODES.MERGE_FAVORITES_ONLY
    showImportModal.value = true
  }
}

const confirmImport = () => {
  if (isDestructiveImportMode(selectedMode.value)) {
    const confirmed = window.confirm(
      'This replaces your current combat list and round. This cannot be undone.',
    )
    if (!confirmed) return
  }

  applyImportedState(selectedMode.value)
  showImportModal.value = false
}

const cancelImport = () => {
  showImportModal.value = false
  pendingState.value = null
}
</script>

<template>
  <div class="app-header">
    <div class="header-content">
      <div class="title-section">
        <h1 class="app-title">5e Encounter Builder</h1>
        <p class="api-credit">
          Powered by
          <a href="https://open5e.com/" target="_blank" rel="noopener noreferrer" class="api-link">
            Open5e API
          </a>
        </p>
      </div>

      <div class="button-group">
        <button @click="$emit('toggle-monster-list')">
          <span class="button-text">{{ showMonsterList ? 'Hide Search' : 'Search Monsters' }}</span>
          <span class="button-text-mobile">Monsters</span>
        </button>
        <button @click="$emit('toggle-favorite-list')">
          <span class="button-text">{{
            showFavoriteList ? 'Hide Favorites' : 'Show Favorites'
          }}</span>
          <span class="button-text-mobile">Favorites</span>
        </button>
        <button @click="$emit('toggle-combat-encounter')">
          <span class="button-text">{{ showCombatEncounter ? 'Hide Combat' : 'Show Combat' }}</span>
          <span class="button-text-mobile">Combat</span>
        </button>
        <button @click="exportState">
          <span class="button-text">Export State</span>
          <span class="button-text-mobile">Export</span>
        </button>
        <button @click="triggerImport">
          <span class="button-text">Import State</span>
          <span class="button-text-mobile">Import</span>
        </button>
        <button @click="showAbout = true">
          <span class="button-text">About</span>
          <span class="button-text-mobile">About</span>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="file-input"
          @change="onFileSelected"
        />
      </div>
    </div>

    <p v-if="importError" class="import-message import-error">{{ importError }}</p>
    <p v-else-if="importMessage" class="import-message import-success">{{ importMessage }}</p>
  </div>

  <div v-if="showImportModal" class="import-overlay" @click.self="cancelImport">
    <div class="import-modal">
      <h2>Import State</h2>
      <p>
        This save file contains {{ favoriteCount }} favorite monster(s) and {{ combatCount }} combat
        entr{{ combatCount === 1 ? 'y' : 'ies' }} (round {{ importRound }}).
      </p>

      <label v-for="mode in importModes" :key="mode.value" class="import-option">
        <input type="radio" name="import-mode" :value="mode.value" v-model="selectedMode" />
        <span class="import-option-text">
          <strong>{{ mode.label }}</strong>
          <small>{{ mode.description }}</small>
        </span>
      </label>

      <p v-if="isDestructiveImportMode(selectedMode)" class="import-warning">
        Your current combat list and round will be replaced.
      </p>

      <div class="import-actions">
        <button class="import-btn cancel" @click="cancelImport">Cancel</button>
        <button class="import-btn primary" @click="confirmImport">Import</button>
      </div>
    </div>
  </div>

  <AboutModal :show="showAbout" @close="showAbout = false" />
</template>

<style scoped>
.app-header {
  padding: 1rem;
  background-color: #333;
  color: #fff;
  border: 2px solid #444;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.api-credit {
  font-size: 0.875rem;
  color: #ccc;
  margin: 0;
}

.api-link {
  color: #4caf50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.api-link:hover {
  color: #66bb6a;
  text-decoration: underline;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* Responsive button text */
.button-text {
  display: none;
}

.button-text-mobile {
  display: inline;
}

@media (min-width: 768px) {
  .button-text {
    display: inline;
  }

  .button-text-mobile {
    display: none;
  }
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .title-section {
    align-items: center;
  }

  .app-title {
    font-size: 1.3rem;
  }

  .button-group {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .api-credit {
    font-size: 0.8rem;
  }
}

/* State export/import */
.file-input {
  display: none;
}

.import-message {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
}

.import-error {
  color: #ff6b6b;
}

.import-success {
  color: #66bb6a;
}

.import-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-modal {
  background-color: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 420px;
  width: calc(100% - 2rem);
  color: #fff;
}

.import-modal h2 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}

.import-modal p {
  margin: 0 0 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.import-btn {
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.2s ease;
}

.import-btn.cancel {
  background-color: #666;
}

.import-btn.cancel:hover {
  background-color: #777;
}

.import-btn.primary {
  background-color: #4a90e2;
}

.import-btn.primary:hover {
  background-color: #357abd;
}

.import-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.import-option:hover {
  border-color: #666;
}

.import-option input {
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.import-option-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.import-option-text strong {
  font-size: 0.9rem;
}

.import-option-text small {
  color: #aaa;
  font-size: 0.78rem;
}

.import-warning {
  margin: 0.5rem 0 0;
  color: #ffb347;
  font-size: 0.85rem;
}
</style>
