<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import MonsterListHeader from '@/components/base/MonsterListHeader.vue'
import MonsterRow from '@/components/base/MonsterRow.vue'
import MonsterSearch from '@/components/MonsterSearch.vue'
import AddMonsterModal from '@/modals/AddMonsterModal.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useCombat } from '@/composables/useCombat.js'
import { provideMonsterSearch } from '@/composables/useMonsterSearch.js'
import { useRowFeedback } from '@/composables/useRowFeedback.js'

const header = 'Monster List'
const showAddModal = ref(false)

// Search/filter/sort is owned here and provided to MonsterSearch.
const { displayMonsters, isLoading, sortBy, sortMonsters, getSortIcon } = provideMonsterSearch()
const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites()
const { addToCombat } = useCombat()

// Adding to combat briefly highlights the row.
const { flash: flashRow, isFlashing: isRowFlashing } = useRowFeedback()

const sortColumn = (key, label, className) => ({
  key,
  label,
  className,
  sortable: true,
  sorted: sortBy.value === key,
  icon: getSortIcon(key),
})

const columns = computed(() => [
  sortColumn('name', 'Name', 'col-name'),
  sortColumn('type', 'Type', 'col-type'),
  sortColumn('challengeRating', 'CR', 'col-cr'),
  sortColumn('hitPoints', 'HP', 'col-hp'),
  sortColumn('armorClass', 'AC', 'col-ac'),
  { key: 'favorite', label: 'Fav', className: 'col-fav' },
])

const rowColumns = (monster) => [
  { key: 'name', value: monster.label, className: 'col-name' },
  { key: 'type', value: monster.type, className: 'col-type' },
  { key: 'cr', value: monster.challengeRatingDisplay, className: 'col-cr' },
  { key: 'hp', value: monster.hitPoints, className: 'col-hp' },
  { key: 'ac', value: monster.armorClass || '-', className: 'col-ac' },
]

// Clicking a row adds the monster to the combat list. Bookmarking is a separate,
// explicit action (the star) so clicking a row never has a hidden side effect.
const addToCombatList = (monster) => {
  addToCombat(monster)
  flashRow(monster.id)
}

// The star toggles the bookmark and always reflects the real favorite state.
const toggleFavorite = (monster, event) => {
  event.stopPropagation()

  if (isInFavorites(monster)) {
    removeFromFavorites(monster)
  } else {
    addToFavorites(monster)
  }
}
</script>

<template>
  <div class="monster-container container monster-table--monsters">
    <div class="header">
      <h1>{{ header }}</h1>
      <BaseButton variant="primary" @click="showAddModal = true">+ Add Monster</BaseButton>
    </div>

    <MonsterSearch />

    <MonsterListHeader :columns="columns" @sort="sortMonsters" />

    <p v-if="displayMonsters.length > 0" class="list-summary">
      Found {{ displayMonsters.length }} monsters
      <small class="click-hint">Click a row to add to combat &middot; ☆ to bookmark</small>
    </p>

    <div class="scroll-container">
      <ul>
        <MonsterRow
          v-for="monster in displayMonsters"
          :key="monster.id"
          :columns="rowColumns(monster)"
          :highlighted="isRowFlashing(monster.id)"
          @select="addToCombatList(monster)"
        >
          <template #actions>
            <BaseIconButton
              tone="favorite"
              :active="isInFavorites(monster)"
              :label="
                isInFavorites(monster)
                  ? `Remove ${monster.label} from favorites`
                  : `Add ${monster.label} to favorites`
              "
              @click="toggleFavorite(monster, $event)"
            >
              {{ isInFavorites(monster) ? '★' : '☆' }}
            </BaseIconButton>
          </template>
        </MonsterRow>
      </ul>

      <div v-if="isLoading" class="loading-indicator">
        <p>Loading monsters...</p>
      </div>
    </div>

    <AddMonsterModal :is-open="showAddModal" @close="showAddModal = false" />
  </div>
</template>

<style scoped>
/* Table layout and cell styling are shared in assets/components.css via the
   `.monster-table--monsters` variant. Only panel-specific spacing is kept here. */
.header {
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
}

.list-summary {
  margin-top: 0;
}

.click-hint {
  display: block;
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Responsive design */
@media (max-width: 767px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
