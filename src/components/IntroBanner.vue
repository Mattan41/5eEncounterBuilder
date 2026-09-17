<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIconButton from '@/components/base/BaseIconButton.vue'
import { useUiState } from '@/composables/useUiState.js'

// Shown once, until the user dismisses it, so a first-time visitor knows what
// the app is without an intro modal blocking the page.
const { openMonsterList, openAbout, dismissIntro } = useUiState()
</script>

<template>
  <aside class="intro-banner container">
    <div class="intro-text">
      <strong>Welcome to 5e Encounter Builder</strong>
      <p>
        Search a monster library, bookmark favorites and run an initiative order for your table
        &mdash; everything stays in this browser.
      </p>
    </div>

    <div class="intro-actions">
      <BaseButton variant="primary" @click="openMonsterList">Search monsters</BaseButton>
      <BaseButton variant="secondary" @click="openAbout">How it works</BaseButton>
      <BaseIconButton tone="close" label="Dismiss introduction" @click="dismissIntro">
        &times;
      </BaseIconButton>
    </div>
  </aside>
</template>

<style scoped>
.intro-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 1rem 1rem 0;
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--amber);
}

.intro-text strong {
  color: var(--amber);
}

.intro-text p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.intro-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .intro-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .intro-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
