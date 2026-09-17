import { computed, inject, provide, ref, watch } from 'vue'
import { getOpen5e } from '../api/open5e.js'
import { crToDecimal, formatCR } from '../utils/formatCR.js'
import { resolveMonsterId } from '../utils/monsterId.js'

// Injection key so MonsterSearch can render the state owned by TheMonsterList.
export const MONSTER_SEARCH_KEY = Symbol('monsterSearch')

const SEARCH_DEBOUNCE_MS = 350

/**
 * Open5e search/filter/sort logic. Call once in TheMonsterList (setup scope) so
 * the watchers are bound to the component lifecycle.
 * @returns {object}
 */
export const useMonsterSearch = () => {
  const searchQuery = ref('')
  const selectedCR = ref('')
  const selectedCRMax = ref('')
  const selectedType = ref('')
  const selectedDocument = ref('')
  const showAdvancedSearch = ref(false)

  const sortBy = ref('name')
  const sortOrder = ref('asc')

  const results = ref([])
  const totalResults = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  const availableDocuments = ref([{ value: '', label: 'All Sources' }])
  const loadingDocuments = ref(false)

  let debounceTimer = null
  // Increments on every request so stale responses are discarded (latest wins).
  let requestToken = 0

  const crRangeInvalid = computed(() => {
    if (!selectedCR.value || !selectedCRMax.value) return false
    return parseFloat(crToDecimal(selectedCR.value)) > parseFloat(crToDecimal(selectedCRMax.value))
  })

  const crRangeError = computed(() =>
    crRangeInvalid.value ? 'Minimum CR cannot be higher than maximum CR.' : '',
  )

  const hasActiveFilters = computed(
    () =>
      Boolean(selectedCR.value) ||
      Boolean(selectedCRMax.value) ||
      Boolean(selectedType.value) ||
      Boolean(selectedDocument.value),
  )

  const buildParams = () => {
    const params = { limit: 1000 }

    if (searchQuery.value.trim()) params.name__icontains = searchQuery.value.trim()
    // Open5e v2 expects the lowercase type key (e.g. "dragon"); capitalized values
    // return HTTP 400 and type__name/type__key are silently ignored by the API.
    if (selectedType.value) params.type = selectedType.value.toLowerCase()
    if (selectedCR.value) params.challenge_rating__gte = crToDecimal(selectedCR.value)
    if (selectedCRMax.value) params.challenge_rating__lte = crToDecimal(selectedCRMax.value)
    if (selectedDocument.value) params.document__key__in = selectedDocument.value

    return params
  }

  const mapCreature = (creature) => {
    const crFloat = parseFloat(creature.challenge_rating || 0)
    const mapped = {
      ...creature,
      slug: creature.key,
      key: creature.key,
      label: creature.name,
      type: typeof creature.type === 'object' ? creature.type?.name || '' : creature.type,
      challengeRating: crFloat,
      challengeRatingDisplay: formatCR(crFloat),
      hitPoints: creature.hit_points,
      originalHitPoints: creature.hit_points,
      armorClass: creature.armor_class,
      source: 'open5e',
    }
    mapped.id = resolveMonsterId(mapped)
    return mapped
  }

  /**
   * Runs the search against Open5e using all active filters as server-side
   * query parameters, then sorts the results client-side.
   */
  const search = async () => {
    if (crRangeInvalid.value) return

    const token = ++requestToken
    isLoading.value = true
    error.value = ''

    try {
      const data = await getOpen5e('/creatures/', buildParams())
      if (token !== requestToken) return

      results.value = (data.results || []).map(mapCreature)
      totalResults.value = data.count || 0
    } catch (err) {
      if (token !== requestToken) return

      error.value = err.message || 'Failed to load monsters'
      results.value = []
      totalResults.value = 0
    } finally {
      if (token === requestToken) isLoading.value = false
    }
  }

  /** Runs a search immediately (search button, enter key, filter change). */
  const searchNow = () => {
    clearTimeout(debounceTimer)
    return search()
  }

  /** Runs a debounced search (free text typing). */
  const debouncedSearch = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(search, SEARCH_DEBOUNCE_MS)
  }

  const clearFilters = () => {
    selectedCR.value = ''
    selectedCRMax.value = ''
    selectedType.value = ''
    selectedDocument.value = ''
    searchNow()
  }

  const loadDocuments = async () => {
    loadingDocuments.value = true

    try {
      const data = await getOpen5e('/documents/', { limit: 200 })
      availableDocuments.value = [
        { value: '', label: 'All Sources' },
        ...(data.results || [])
          .map((doc) => ({ value: doc.key, label: doc.name }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      ]
    } catch (err) {
      console.error('Error fetching documents:', err)
      // Fallback with valid Open5e v2 document keys.
      availableDocuments.value = [
        { value: '', label: 'All Sources' },
        { value: 'srd-2014', label: '5e SRD (2014)' },
        { value: 'srd-2024', label: '5e SRD (2024)' },
        { value: 'a5e-mm', label: 'Monstrous Menagerie' },
        { value: 'tob', label: 'Tome of Beasts' },
        { value: 'tob-2023', label: 'Tome of Beasts (2023)' },
        { value: 'tob2', label: 'Tome of Beasts 2' },
        { value: 'ccdx', label: 'Creature Codex' },
        { value: 'bfrd', label: 'Basic Fantasy RPG' },
      ]
    } finally {
      loadingDocuments.value = false
    }
  }

  // Filter dropdowns trigger a search immediately, free text is debounced.
  watch([selectedCR, selectedCRMax, selectedType, selectedDocument], () => searchNow())
  watch(searchQuery, () => debouncedSearch())

  const displayMonsters = computed(() =>
    [...results.value].sort((a, b) => {
      let valA = a[sortBy.value]
      let valB = b[sortBy.value]

      if (
        sortBy.value === 'challengeRating' ||
        sortBy.value === 'hitPoints' ||
        sortBy.value === 'armorClass'
      ) {
        valA = parseFloat(valA) || 0
        valB = parseFloat(valB) || 0
      } else {
        valA = (valA ?? '').toString().toLowerCase()
        valB = (valB ?? '').toString().toLowerCase()
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    }),
  )

  const sortMonsters = (field) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }

  const getSortIcon = (field) => {
    if (sortBy.value !== field) return '↕️'
    return sortOrder.value === 'asc' ? '↑' : '↓'
  }

  const getSortClass = (field) => (sortBy.value === field ? 'sorted' : '')

  return {
    searchQuery,
    selectedCR,
    selectedCRMax,
    selectedType,
    selectedDocument,
    showAdvancedSearch,
    sortBy,
    sortOrder,
    results,
    displayMonsters,
    totalResults,
    isLoading,
    error,
    availableDocuments,
    loadingDocuments,
    crRangeInvalid,
    crRangeError,
    hasActiveFilters,
    search,
    searchNow,
    clearFilters,
    loadDocuments,
    sortMonsters,
    getSortIcon,
    getSortClass,
  }
}

/**
 * Creates the search state and provides it to descendant components.
 * Must be called from a component setup.
 * @returns {object}
 */
export const provideMonsterSearch = () => {
  const search = useMonsterSearch()
  provide(MONSTER_SEARCH_KEY, search)
  return search
}

/**
 * Reads the provided search state. Must be called from a descendant setup.
 * @returns {object}
 */
export const useInjectedMonsterSearch = () => inject(MONSTER_SEARCH_KEY)
