<script setup>
import { ref } from 'vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import MonsterListHeader from '@/components/base/MonsterListHeader.vue'
import MonsterRow from '@/components/base/MonsterRow.vue'
import CreatureModal from '@/modals/CreatureModal.vue'
import { useFavorites } from '@/composables/useFavorites.js'
import { useCombat } from '@/composables/useCombat.js'
import { useRowFeedback } from '@/composables/useRowFeedback.js'

const { favoriteMonsters, removeFromFavorites } = useFavorites()
const { addToCombat } = useCombat()

const showCreatureModal = ref(false)
const selectedCreature = ref(null)

const { flash: flashRow, isFlashing: isRowFlashing } = useRowFeedback()

const columns = [
  { key: 'name', label: 'Name', className: 'col-name' },
  { key: 'type', label: 'Type', className: 'col-type' },
  { key: 'cr', label: 'CR', className: 'col-cr' },
  { key: 'hp', label: 'HP', className: 'col-hp' },
  { key: 'actions', label: 'Actions', className: 'col-actions' },
]

const rowColumns = (monster) => [
  { key: 'name', value: monster.label, className: 'col-name' },
  { key: 'type', value: monster.type, className: 'col-type' },
  { key: 'cr', value: monster.challengeRatingDisplay, className: 'col-cr' },
  { key: 'hp', value: monster.hitPoints, className: 'col-hp' },
]

// Clicking a row adds the monster to the combat list.
const addToCombatList = (monster) => {
  addToCombat(monster)
  flashRow(monster.id)
}

const removeFromFavoriteList = (monster, event) => {
  event.stopPropagation()
  removeFromFavorites(monster)
}

const showCreatureDetails = (monster, event) => {
  event.stopPropagation()
  selectedCreature.value = monster
  showCreatureModal.value = true
}

const closeCreatureModal = () => {
  showCreatureModal.value = false
  selectedCreature.value = null
}
</script>

<template>
  <div class="favorite-container container monster-table--favorites">
    <div class="header">
      <h1>⭐ Favorite Monsters</h1>
    </div>

    <div v-if="favoriteMonsters.length === 0" class="empty-state">
      <div class="empty-icon">⭐</div>
      <p>No favorite monsters yet</p>
      <small>Add some from the monster search!</small>
    </div>

    <div v-else class="favorites-content">
      <div class="favorite-stats">
        <span class="favorite-count"
          >{{ favoriteMonsters.length }} favorite{{
            favoriteMonsters.length !== 1 ? 's' : ''
          }}</span
        >
        <span class="click-hint">Click to add to combat</span>
      </div>

      <MonsterListHeader :columns="columns" />

      <div class="scroll-container favorites-scroll-container">
        <ul>
          <MonsterRow
            v-for="monster in favoriteMonsters"
            :key="monster.id"
            variant="favorite"
            :columns="rowColumns(monster)"
            :highlighted="isRowFlashing(monster.id)"
            @select="addToCombatList(monster)"
          >
            <template #actions>
              <BaseIconButton
                tone="info"
                :label="`Show ${monster.label} details`"
                @click="showCreatureDetails(monster, $event)"
              >
                ℹ️
              </BaseIconButton>
              <BaseIconButton
                tone="remove"
                :label="`Remove ${monster.label} from favorites`"
                @click="removeFromFavoriteList(monster, $event)"
              >
                ✕
              </BaseIconButton>
            </template>
          </MonsterRow>
        </ul>
      </div>
      <CreatureModal
        :show="showCreatureModal"
        :creature="selectedCreature"
        @close="closeCreatureModal"
      />
    </div>
  </div>
</template>

<style scoped>
.favorite-container {
  background: linear-gradient(135deg, #2a2419 0%, #1a1a1a 100%);
  border: 1px solid #8b6914;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.1);
}

/* Header styling */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #8b6914;
}

.header h1 {
  color: #ffa500;
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #ccc;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #ddd;
}

.empty-state small {
  color: #999;
  font-style: italic;
}

/* Favorites content */
.favorites-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Stats bar */
.favorite-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 165, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 165, 0, 0.2);
}

.favorite-count {
  color: #ffa500;
  font-weight: 600;
  font-size: 0.95rem;
}

.click-hint {
  color: #cccccc;
  font-size: 0.85rem;
  font-style: italic;
}

/* Scroll container: sizing only, the shared .scroll-container handles the rest */
.favorites-scroll-container {
  flex: 1;
  min-height: 200px;
}

/* Responsive design */
@media (max-width: 767px) {
  .header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .favorite-stats {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
