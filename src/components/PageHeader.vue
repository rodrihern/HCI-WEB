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
      <h1 class="t-heading font-semibold text-gray-800">{{ title }}</h1>
      <button 
        v-if="showFilter"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg class="w-7 h-7 text-gray-700" fill="none" stroke="currentColor">
          <use href="@/assets/sprite.svg#filter" />
        </svg>
      </button>
    </div>
    
    <!-- Botón de agregar -->
    <button
      @click="onAddClick"
      class="bg-gradient-to-br from-[#68AE6F] to-[#5a9860] hover:from-[#5a9860] hover:to-[#4d8251] text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
    >
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
      </svg>
    </button>
  </div>
</template>
