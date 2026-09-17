<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { IMPORT_MODES, isDestructiveImportMode, useAppState } from '@/composables/useAppState.js'
import { useUiState } from '@/composables/useUiState.js'

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
const selectedMode = ref(IMPORT_MODES.MERGE_FAVORITES_ONLY)

// The About dialog lives in App.vue so the header, the intro banner and the
// panel empty states can all open the same instance.
const { openAbout } = useUiState()

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
      <div class="header-left">
        <BaseButton variant="secondary" @click="openAbout">
          <span class="button-text">About</span>
          <span class="button-text-mobile">About</span>
        </BaseButton>

        <div class="title-section">
          <h1 class="app-title">5e Encounter Builder</h1>
          <p class="app-tagline">
            Search monsters &middot; bookmark favorites &middot; run initiative
          </p>
          <p class="api-credit">
            Powered by
            <a
              href="https://open5e.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="api-link"
            >
              Open5e API
            </a>
          </p>
        </div>
      </div>

      <div class="header-right">
        <div class="button-group view-toggles">
          <BaseButton
            variant="ghost"
            toggle
            :active="showMonsterList"
            @click="$emit('toggle-monster-list')"
          >
            <span class="button-text">{{
              showMonsterList ? 'Hide Search' : 'Search Monsters'
            }}</span>
            <span class="button-text-mobile">Monsters</span>
          </BaseButton>
          <BaseButton
            variant="ghost"
            toggle
            :active="showFavoriteList"
            @click="$emit('toggle-favorite-list')"
          >
            <span class="button-text">{{
              showFavoriteList ? 'Hide Favorites' : 'Show Favorites'
            }}</span>
            <span class="button-text-mobile">Favorites</span>
          </BaseButton>
          <BaseButton
            variant="ghost"
            toggle
            :active="showCombatEncounter"
            @click="$emit('toggle-combat-encounter')"
          >
            <span class="button-text">{{
              showCombatEncounter ? 'Hide Combat' : 'Show Combat'
            }}</span>
            <span class="button-text-mobile">Combat</span>
          </BaseButton>
        </div>

        <div class="button-group utility-actions">
          <BaseButton variant="secondary" @click="exportState">
            <span class="button-text">Export State</span>
            <span class="button-text-mobile">Export</span>
          </BaseButton>
          <BaseButton variant="secondary" @click="triggerImport">
            <span class="button-text">Import State</span>
            <span class="button-text-mobile">Import</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      class="file-input"
      @change="onFileSelected"
    />

    <p v-if="importError" class="import-message import-error">{{ importError }}</p>
    <p v-else-if="importMessage" class="import-message import-success">{{ importMessage }}</p>
  </div>

  <BaseModal :show="showImportModal" title="Import State" @close="cancelImport">
    <div class="import-body">
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
        <BaseButton variant="secondary" @click="cancelImport">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirmImport">Import</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.app-header {
  padding: 1rem;
  background-color: var(--surface-raised);
  color: var(--text-strong);
  border: 2px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* About button + app title, pinned to the left of the header */
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

/* View toggles and state utilities, grouped on the right */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
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
  color: var(--text-soft);
  margin: 0;
}

.app-tagline {
  font-size: 0.85rem;
  color: var(--text-muted);
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

/* Visual separator between view toggles and state utilities */
.utility-actions {
  border-left: 1px solid var(--border-subtle);
  padding-left: 1rem;
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

  .header-left {
    flex-direction: column;
    align-items: center;
  }

  .header-right {
    justify-content: center;
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

  .utility-actions {
    border-left: none;
    padding-left: 0;
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
  color: var(--danger-soft);
}

.import-success {
  color: var(--success-soft);
}

.import-body {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem 1.5rem;
}

.import-body > p {
  margin: 0 0 0.5rem;
  color: var(--text-soft);
  font-size: 0.9rem;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.import-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.import-option:hover {
  border-color: #666666;
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
  color: #aaaaaa;
  font-size: 0.78rem;
}

.import-warning {
  margin: 0.5rem 0 0;
  color: #ffb347;
  font-size: 0.85rem;
}
</style>
