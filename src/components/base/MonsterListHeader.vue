<script setup>
/**
 * Presentational sortable column header shared by the monster tables.
 * Column shape: { key, label, icon?, sortable?, sorted?, className? }
 */
defineProps({
  columns: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['sort'])
</script>

<template>
  <div class="monster-list-header">
    <span
      v-for="column in columns"
      :key="column.key"
      :class="[column.className, { sortable: column.sortable, sorted: column.sorted }]"
      @click="column.sortable && emit('sort', column.key)"
    >
      {{ column.label }}<template v-if="column.icon"> {{ column.icon }}</template>
    </span>
  </div>
</template>
