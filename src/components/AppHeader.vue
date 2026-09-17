<script setup>
import { ref } from 'vue'
import { useAppState } from '@/composables/useAppState.js'

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

const fileInput = ref(null)
const showImportModal = ref(false)

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
    showImportModal.value = true
  }
}

const chooseMerge = () => {
  applyImportedState('merge')
  showImportModal.value = false
}

const chooseReplace = () => {
  const confirmed = window.confirm(
    'Replace your current combat and favorite lists with the save file? This cannot be undone.',
  )
  if (!confirmed) return

  applyImportedState('replace')
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
        The save file contains {{ pendingState?.favoriteMonsters?.length || 0 }} favorite monster(s)
        and {{ pendingState?.combatMonsters?.length || 0 }} combat entr(ies).
      </p>
      <p>Merge adds new entries to the current session. Replace overwrites everything.</p>
      <div class="import-actions">
        <button class="import-btn cancel" @click="cancelImport">Cancel</button>
        <button class="import-btn merge" @click="chooseMerge">Merge</button>
        <button class="import-btn replace" @click="chooseReplace">Replace</button>
      </div>
    </div>
  </div>
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

.import-btn.merge {
  background-color: #4a90e2;
}

.import-btn.merge:hover {
  background-color: #357abd;
}

.import-btn.replace {
  background-color: #c0392b;
}

.import-btn.replace:hover {
  background-color: #a93226;
}
</style>
