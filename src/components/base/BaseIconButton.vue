<script setup>
import { computed } from 'vue'

/**
 * Presentational icon-only button (favorite star, info, remove, close).
 * Always requires a `label` because the content is a glyph, not readable text.
 */
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'favorite', 'remove', 'info', 'close'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const classes = computed(() => [
  'btn',
  'btn-icon',
  props.tone === 'default' ? '' : `btn-icon-${props.tone}`,
  { 'is-active': props.active },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :title="label"
    :aria-label="label"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
