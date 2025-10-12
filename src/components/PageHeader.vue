<script setup lang="ts">
defineProps<{
  title: string
  onAddClick: () => void
  showFilter?: boolean
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-4">
      <h1 class="text-3xl font-semibold text-gray-800">{{ title }}</h1>
      <button
        v-if="showFilter"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span class="material-icons text-gray-700 text-3xl">filter_list</span>
      </button>
    </div>

    <!-- Botón de agregar -->
    <button
      @click="onAddClick"
      class="bg-gradient-to-br from-[#68AE6F] to-[#5a9860] hover:from-[#5a9860] hover:to-[#4d8251] text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
    >
      <span class="material-icons text-white text-4xl">add</span>
    </button>
  </div>
</template>
