<script setup>
/**
 * Presentational monster table row.
 * Cell shape: { key, value, className? }
 *
 * The grid template comes from the enclosing `.monster-table--*` variant,
 * so the row stays layout-agnostic. Action buttons are passed via the
 * `actions` slot. Emits `select` with the native click event so the parent
 * can react to the row (and read `currentTarget` for row-level feedback).
 */
defineProps({
  columns: {
    type: Array,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'favorite'].includes(value),
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <li
    class="monster-row"
    :class="[variant === 'favorite' ? 'monster-row--favorite' : '', { blink: highlighted }]"
    @click="emit('select', $event)"
  >
    <span v-for="column in columns" :key="column.key" :class="column.className">
      {{ column.value }}
    </span>
    <span v-if="$slots.actions" class="monster-actions">
      <slot name="actions" />
    </span>
  </li>
</template>
