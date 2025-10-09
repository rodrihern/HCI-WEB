<script setup lang="ts">
defineProps<{
  icon: string
  name: string
  onActionClick?: () => void
  actionIcon?: string
}>()
</script>

<template>
  <div class="bg-verde-claro rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-2xl">{{ icon }}</span>
      <span class="text-white font-medium">{{ name }}</span>
    </div>
    
    <button 
      v-if="onActionClick"
      class="p-2 hover:bg-verde-contraste/60 rounded-lg transition-colors"
      @click="onActionClick"
    >
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor">
        <use :href="`@/assets/sprite.svg#${actionIcon || 'add-sign'}`" />
      </svg>
    </button>
    
    <!-- Slot para contenido personalizado (ej: controles de cantidad) -->
    <slot name="actions" />
  </div>
</template>
