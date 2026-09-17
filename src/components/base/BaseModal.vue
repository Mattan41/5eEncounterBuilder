<script setup>
import BaseIconButton from './BaseIconButton.vue'

/**
 * Presentational modal shell used by every dialog in the app.
 *
 * variant="default"  - sticky header with title + close button
 * variant="floating" - no header bar, close button pinned to the top-right
 *                      (used by the full-creature sheet)
 */
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'floating'].includes(value),
  },
  wide: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content" :class="{ 'modal-wide': wide }">
      <template v-if="variant === 'default'">
        <div class="modal-header">
          <h2 v-if="title">{{ title }}</h2>
          <slot name="header" />
          <BaseIconButton tone="close" label="Close" @click="emit('close')">&times;</BaseIconButton>
        </div>
        <slot />
      </template>

      <template v-else>
        <BaseIconButton class="modal-close" tone="close" label="Close" @click="emit('close')">
          &times;
        </BaseIconButton>
        <slot />
      </template>
    </div>
  </div>
</template>
