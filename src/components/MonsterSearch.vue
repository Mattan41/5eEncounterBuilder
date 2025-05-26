<script setup>
import { ref, watch, onMounted, computed} from 'vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedCR: { type: String, default: '' },
  selectedCRMax: { type: String, default: '' },
  selectedType: { type: String, default: '' },
  selectedDocument: { type: String, default: '' },
  showAdvancedSearch: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  totalResults: { type: Number, default: 0 }
})

const emits = defineEmits([
  'update:searchQuery',
  'update:selectedCR',
  'update:selectedCRMax',
  'update:selectedType',
  'update:selectedDocument',
  'update:showAdvancedSearch',
  'search'
])

// Lokala reactive copies
const localSearchQuery = ref(props.searchQuery)
const localSelectedCR = ref(props.selectedCR)
const localSelectedCRMax = ref(props.selectedCRMax)
const localSelectedType = ref(props.selectedType)
const localSelectedDocument = ref(props.selectedDocument)
const localShowAdvanced = ref(props.showAdvancedSearch)

// Källor från API
const availableDocuments = ref([])
const loadingDocuments = ref(false)

// Synka med parent
watch(localSearchQuery, (value) => emits('update:searchQuery', value))
watch(localSelectedCR, (value) => emits('update:selectedCR', value))
watch(localSelectedCRMax, (value) => emits('update:selectedCRMax', value))
watch(localSelectedType, (value) => emits('update:selectedType', value))
watch(localSelectedDocument, (value) => emits('update:selectedDocument', value))
watch(localShowAdvanced, (value) => emits('update:showAdvancedSearch', value))

// Hämta källor från API
const fetchDocuments = async () => {
  try {
    loadingDocuments.value = true
    const response = await fetch('https://api.open5e.com/v1/documents/')
    const data = await response.json()

    availableDocuments.value = [
      { value: '', label: 'All Sources' },
      ...data.results
          .filter(doc => doc.monsters_count > 0) // Bara dokument med monster
          .map(doc => ({
            value: doc.slug,
            label: `${doc.title} (${doc.monsters_count})`
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
    ]
  } catch (error) {
    console.error('Error fetching documents:', error)
    // Fallback till vanliga källor
    availableDocuments.value = [
      { value: '', label: 'All Sources' },
      { value: 'srd', label: 'System Reference Document' },
      { value: 'mm', label: 'Monster Manual' },
      { value: 'vgtm', label: "Volo's Guide to Monsters" },
      { value: 'mtf', label: 'Mordenkainen\'s Tome of Foes' },
      { value: 'toa', label: 'Tomb of Annihilation' }
    ]
  } finally {
    loadingDocuments.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})

const crOptions = [
  { value: '', label: 'Any' },
  { value: '0', label: '0' },
  { value: '0.125', label: '1/8' },
  { value: '0.25', label: '1/4' },
  { value: '0.5', label: '1/2' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: '25', label: '25' },
  { value: '30', label: '30' }
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'beast', label: 'Beast' },
  { value: 'humanoid', label: 'Humanoid' },
  { value: 'monstrosity', label: 'Monstrosity' },
  { value: 'undead', label: 'Undead' },
  { value: 'fiend', label: 'Fiend' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'fey', label: 'Fey' },
  { value: 'elemental', label: 'Elemental' },
  { value: 'celestial', label: 'Celestial' },
  { value: 'aberration', label: 'Aberration' },
  { value: 'construct', label: 'Construct' },
  { value: 'giant', label: 'Giant' },
  { value: 'ooze', label: 'Ooze' },
  { value: 'plant', label: 'Plant' }
]

const handleSearch = () => {
  emits('search')
}

const clearFilters = () => {
  localSelectedCR.value = ''
  localSelectedCRMax.value = ''
  localSelectedType.value = ''
  localSelectedDocument.value = ''
  handleSearch()
}

const hasActiveFilters = computed(() => {
  return localSelectedCR.value ||
      localSelectedCRMax.value ||
      localSelectedType.value ||
      localSelectedDocument.value
})
</script>

<template>
  <div class="search-section">
    <div class="search-form">
      <!-- Grundläggande sök -->
      <div class="search-row">
        <input
            v-model="localSearchQuery"
            class="search-input"
            type="text"
            placeholder="Search monsters..."
            @keyup.enter="handleSearch"
        >
        <div class="button-group">
          <button @click="handleSearch" :disabled="isLoading" class="btn btn-primary">
            {{ isLoading ? 'Searching...' : 'Search' }}
          </button>
          <button
              @click="localShowAdvanced = !localShowAdvanced"
              class="btn btn-secondary advanced-toggle"
          >
            {{ localShowAdvanced ? 'Hide' : 'Filters' }}
          </button>
        </div>
      </div>

      <!-- Avancerad sökning -->
      <div v-if="localShowAdvanced" class="advanced-filters">
        <div class="filter-row">
          <!-- Challenge Rating Spann -->
          <div class="filter-group">
            <label>Challenge Rating</label>
            <div class="cr-range">
              <select v-model="localSelectedCR">
                <option v-for="option in crOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <span>to</span>
              <select v-model="localSelectedCRMax">
                <option v-for="option in crOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Monster Type -->
          <div class="filter-group">
            <label>Type</label>
            <select v-model="localSelectedType">
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-row">
          <!-- Källmaterial -->
          <div class="filter-group">
            <label>Source</label>
            <select v-model="localSelectedDocument" :disabled="loadingDocuments">
              <option v-if="loadingDocuments" value="">Loading sources...</option>
              <option
                  v-else
                  v-for="doc in availableDocuments"
                  :key="doc.value"
                  :value="doc.value"
              >
                {{ doc.label }}
              </option>
            </select>
          </div>

          <!-- Tom kolumn för jämn layout -->
          <div class="filter-group"></div>
        </div>

        <!-- Filter actions -->
        <div class="filter-actions">
          <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="btn btn-secondary clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Search results info -->
    <div v-if="totalResults > 0 || isLoading" class="search-results-info">
      <p v-if="isLoading">Searching...</p>
      <p v-else>Found {{ totalResults }} monster{{ totalResults !== 1 ? 's' : '' }}</p>

      <!-- Aktiva filter -->
      <div v-if="hasActiveFilters" class="active-filters">
        <p><strong>Active filters:</strong></p>
        <p v-if="localSelectedCR || localSelectedCRMax">
          CR: {{ localSelectedCR || 'Any' }} - {{ localSelectedCRMax || 'Any' }}
        </p>
        <p v-if="localSelectedType">
          Type: {{ typeOptions.find(t => t.value === localSelectedType)?.label }}
        </p>
        <p v-if="localSelectedDocument">
          Source: {{ availableDocuments.find(d => d.value === localSelectedDocument)?.label }}
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.search-section {
  margin-bottom: 1rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap; /* Lägg till denna */
}

.search-input {
  flex: 1;
  min-width: 200px; /* Lägg till min-width */
}

.advanced-toggle {
  white-space: nowrap;
  flex-shrink: 0; /* Förhindra att knappen krymps */
}

.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-row {
  display: flex;
  gap: 1rem;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: #ccc;
  font-weight: bold;
}

.cr-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cr-range select {
  flex: 1;
}

.cr-range span {
  color: #ccc;
  font-size: 0.9rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.clear-filters-btn {
  background-color: #666;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.clear-filters-btn:hover {
  background-color: #777;
}

.search-results-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  border-left: 4px solid #ccc;
}

.search-results-info p {
  margin: 0.25rem 0;
  color: #ccc;
  font-size: 0.9rem;
}

.active-filters {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsiv design */
@media (max-width: 767px) {
  .search-row {
    flex-direction: column; /* Stack vertikalt på mobil */
  }

  .search-input {
    min-width: unset; /* Ta bort min-width på mobil */
  }

  .advanced-toggle {
    white-space: normal; /* Tillåt text-wrapping på mobil */
  }

  .filter-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .cr-range {
    flex-direction: column;
    align-items: stretch;
  }

  .cr-range span {
    text-align: center;
    margin: 0.25rem 0;
  }

  .advanced-filters {
    padding: 0.75rem; /* Mindre padding på mobil */
  }
}

/* Extra små skärmar */
@media (max-width: 480px) {
  .search-section {
    margin-bottom: 0.75rem;
  }

  .search-form {
    gap: 0.4rem;
  }

  .advanced-filters {
    padding: 0.5rem;
    gap: 0.75rem;
  }

  .filter-group label {
    font-size: 0.8rem;
  }

  .clear-filters-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (min-width: 768px) {
  .search-row {
    max-width: 600px;
  }

  .advanced-filters {
    max-width: 700px;
  }
}
</style>

