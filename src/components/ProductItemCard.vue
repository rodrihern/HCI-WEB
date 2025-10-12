<script setup lang="ts">
import { computed } from 'vue'
import type { ListItemData } from '@/api/listItem'
import type { PantryItem } from '@/api/pantry'
import QuantityControls from './QuantityControls.vue'

interface Props {
  item: ListItemData | PantryItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'delete'): void
  (e: 'togglePurchased'): void
}>()

const isPurchased = computed(() => {
  return 'purchased' in props.item && props.item.purchased
})
</script>

<template>
  <div 
    class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
    :class="{ 'opacity-60': isPurchased }"
  >
    <!-- Imagen del producto (siempre visible) -->
    <div 
      class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
    >
      <img 
        v-if="item.product.metadata?.image" 
        :src="item.product.metadata.image" 
        :alt="item.product.name" 
        class="w-full h-full object-cover" 
      />
      <span v-else class="text-2xl">{{ item.product.metadata?.icon || '📦' }}</span>
    </div>

    <!-- Info del producto -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-gray-800 text-base truncate">
        {{ item.product.name }}
      </h4>
      <p class="text-sm text-gray-500 truncate">
        {{ item.product.category?.name || 'Sin categoría' }}
      </p>
    </div>

    <!-- Unidad -->
    <div class="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-lg">
      <span class="text-sm font-medium text-gray-700">{{ item.unit }}</span>
    </div>

    <!-- Controles de cantidad -->
    <QuantityControls
      :quantity="item.quantity"
      :show-background="true"
      @increment="emit('increment')"
      @decrement="emit('decrement')"
    />

    <!-- Botón eliminar -->
    <button 
      @click="emit('delete')"
      class="flex-shrink-0 w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors text-gray-400 hover:text-red-500"
      title="Eliminar producto"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>
