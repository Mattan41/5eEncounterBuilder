<script setup>
import { computed } from 'vue'

/**
 * Presentational button.
 *
 * Picks a shared semantic variant so every action has an obvious meaning:
 *  - primary   accent colour, the single main action of a view
 *  - secondary neutral utility action (cancel, filters, import/export)
 *  - danger    destructive action (reset combat, remove)
 *  - ghost     subtle outline; `active` marks a toggled-on view
 *  - icon      icon-only action (use BaseIconButton instead when possible)
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'secondary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost', 'icon'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** Marks a toggle button as switched on (adds `.is-active`). */
  active: {
    type: Boolean,
    default: false,
  },
  /** When true the button is announced as a toggle via aria-pressed. */
  toggle: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: undefined,
  },
  ariaLabel: {
    type: String,
    default: undefined,
  },
})

defineEmits(['click'])

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  { 'btn-small': props.size === 'sm', 'is-active': props.active },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled"
    :title="title"
    :aria-label="ariaLabel"
    :aria-pressed="toggle ? active : undefined"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
