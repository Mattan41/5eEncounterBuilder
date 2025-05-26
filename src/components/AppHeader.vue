<script setup>
defineProps({
  showMonsterList: {
    type: Boolean,
    required: true
  },
  showFavoriteList: {
    type: Boolean,
    required: true
  },
  showCombatEncounter: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-monster-list', 'toggle-favorite-list', 'toggle-combat-encounter'])
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
          <span class="button-text">{{ showFavoriteList ? 'Hide Favorites' : 'Show Favorites' }}</span>
          <span class="button-text-mobile">Favorites</span>
        </button>
        <button @click="$emit('toggle-combat-encounter')">
          <span class="button-text">{{ showCombatEncounter ? 'Hide Combat' : 'Show Combat' }}</span>
          <span class="button-text-mobile">Combat</span>
        </button>
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
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.api-link:hover {
  color: #66BB6A;
  text-decoration: underline;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* Responsiv text för buttons */
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
</style>
