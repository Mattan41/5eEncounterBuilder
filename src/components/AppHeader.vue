<script setup>

defineProps({
  showMonsterList: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggleMonsterList'])


</script>

<template>
  <div class="app-header">
    <h1 class="app-title">5e Encounter Builder</h1>
    <button @click="$emit('toggleMonsterList')">
      <span class="button-text">{{ showMonsterList ? 'Hide Monster List' : 'Show Monster List' }}</span>
      <span class="button-text-mobile">Monster List</span>
    </button>
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #333;
  color: #fff;
  border: 2px solid #444;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff9100;
  margin: 0;
}

button {
  padding: 0.5rem 1rem;
  background-color: #ff9100;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
}

button:hover {
  background-color: #ff7b00;
}

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
</style>