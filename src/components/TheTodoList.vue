<script setup>
import {ref} from 'vue'

// props

defineProps({
  changeButtonText: {
    type: String,
    default: 'add item'
  }
});

const header =ref('Todo List')
const editing =ref(false)
const items = ref([
{
    id:1,
    label: "Bädda",
    done: true,
    highPrio: false
},
{
    id:2,
    label: "sova",
    done: false,
    highPrio: true
}

])
const newItem = ref("")
const newItemHighPriority = ref(false)
const saveItem = () => {
    items.value.push(
    {
        id: items.value.length + 1,
        label: newItem.value,
        highPrio: newItemHighPriority.value

    })
    newItem.value = ""
    newItemHighPriority.value = ""
    
}
   
const doEdit = (e) => {
    editing.value = e
    newItem.value = ""
    newItemHighPriority.value = ""
}

const toggleDone = (item) => {
    item.done = !item.done
    
}

const togglePriority = (item, event) => {
  event.preventDefault()
  item.highPrio = !item.highPrio
}
</script>

<template>
    <div class="header">
    <h1>{{ header }}</h1>
      <button v-if="editing" class="btn" @click="doEdit(false)">
        Cancel
    </button>
    <button v-else class="btn btn-primary" @click="doEdit(true)">
        {{ changeButtonText }}
    </button> 
  </div> 
  <form class="add-item-form" v-if="editing" @submit.prevent="saveItem">
    <input v-model.trim="newItem" type="text" placeholder="add chore">
    <label>
        <input type="checkbox" v-model="newItemHighPriority">
        High Priority
    </label>
    <button :disabled="newItem.length < 5" class="btn btn-primary">
        Save chore
    </button>
</form>
<ul>
<!-- Detta är en kommentar class bindings -->
  <li v-for="(item,index) in items" @click="toggleDone(item)" @contextmenu="togglePriority(item, $event)" :key="item.id" class="static-class" :class="{
    strikeout: item.done,
    priority: item.highPrio,
  }">
  {{ item.label }}
  </li>
</ul>

</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.header h1,
.header h3 {
  text-align: center;
}

.strikeout {
  text-decoration: line-through;
}
.priority {
  color: #ff9100;
}

@media (min-width: 1024px) {
  .header h1,
  .header h3 {
    text-align: left;
  }
}
</style>
