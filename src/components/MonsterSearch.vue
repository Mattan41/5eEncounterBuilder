<script setup>
import { ref, watch, onMounted, computed} from 'vue'
import { getOpen5e } from '../api/open5e.js'

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

// Sources from API
const availableDocuments = ref([])
const loadingDocuments = ref(false)

// Synka med parent
watch(localSearchQuery, (value) => emits('update:searchQuery', value))
watch(localSelectedCR, (value) => emits('update:selectedCR', value))
watch(localSelectedCRMax, (value) => emits('update:selectedCRMax', value))
watch(localSelectedType, (value) => emits('update:selectedType', value))
watch(localSelectedDocument, (value) => emits('update:selectedDocument', value))
watch(localShowAdvanced, (value) => emits('update:showAdvancedSearch', value))

// Fetch sources from API
const fetchDocuments = async () => {
  try {
    loadingDocuments.value = true
    const data = await getOpen5e('/documents/')

    availableDocuments.value = [
      { value: '', label: 'All Sources' },
      ...data.results
          .map(doc => ({
            value: doc.key,
            label: doc.name
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
    ]
  } catch (error) {
    console.error('Error fetching documents:', error)
    // Fallback med kända v2 keys
    availableDocuments.value = [
      { value: '', label: 'All Sources' },
      { value: 'wotc-srd', label: '5e Core Rules' },
      { value: 'tob', label: 'Tome of Beasts' },
      { value: 'cc', label: 'Creature Codex' },
      { value: 'tob2', label: 'Tome of Beasts 2' },
      { value: 'tob3', label: 'Tome of Beasts 3' },
      { value: 'a5e-mm', label: 'Monstrous Menagerie' }
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
  { value: '1/8', label: '1/8' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: '21', label: '21' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '24', label: '24' },
  { value: '25', label: '25' },
  { value: '26', label: '26' },
  { value: '27', label: '27' },
  { value: '28', label: '28' },
  { value: '29', label: '29' },
  { value: '30', label: '30' }
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Aberration', label: 'Aberration' },
  { value: 'Beast', label: 'Beast' },
  { value: 'Celestial', label: 'Celestial' },
  { value: 'Construct', label: 'Construct' },
  { value: 'Dragon', label: 'Dragon' },
  { value: 'Elemental', label: 'Elemental' },
  { value: 'Fey', label: 'Fey' },
  { value: 'Fiend', label: 'Fiend' },
  { value: 'Giant', label: 'Giant' },
  { value: 'Humanoid', label: 'Humanoid' },
  { value: 'Monstrosity', label: 'Monstrosity' },
  { value: 'Ooze', label: 'Ooze' },
  { value: 'Plant', label: 'Plant' },
  { value: 'Undead', label: 'Undead' }
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
      <!-- Basic search -->
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

      <!-- Advanced search -->
      <div v-if="localShowAdvanced" class="advanced-filters">
        <div class="filter-row">
          <!-- Challenge Rating range -->
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
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.advanced-toggle {
  white-space: nowrap;
  flex-shrink: 0; /* Prevent button from shrinking */
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

/* Responsive design */
@media (max-width: 767px) {
  .search-row {
    flex-direction: column; /* Stack vertically on mobile */
  }

  .search-input {
    min-width: unset; /* Remove min-width on mobile */
  }

  .advanced-toggle {
    white-space: normal; /* Allow text wrapping on mobile */
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
    padding: 0.75rem; /* Less padding on mobile */
  }
}

/* Extra small screens */
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

