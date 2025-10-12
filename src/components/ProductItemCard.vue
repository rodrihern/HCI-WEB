<script setup lang="ts">
import { computed } from 'vue'
import type { ListItemData } from '@/api/listItem'
import type { PantryItem } from '@/api/pantry'
import type { ProductData } from '@/api/product'
import QuantityControls from './QuantityControls.vue'

type DisplayMode = 'full' | 'addable' | 'readonly'

interface Props {
  // For 'full' and 'readonly' modes: product that's already in list/pantry/history
  item?: ListItemData | PantryItem
  // For 'addable' mode: product available to be added
  product?: ProductData
  // Display mode
  mode?: DisplayMode
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'full'
})

const emit = defineEmits<{
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'delete'): void
  (e: 'togglePurchased'): void
  (e: 'add'): void
}>()

const isPurchased = computed(() => {
  return props.item && 'purchased' in props.item && props.item.purchased
})

const displayProduct = computed(() => {
  if (props.mode === 'addable') {
    return props.product
  }
  return props.item?.product
})

const productImage = computed(() => {
  return displayProduct.value?.metadata?.image
})

const productIcon = computed(() => {
  return displayProduct.value?.metadata?.icon || '📦'
})

const productName = computed(() => {
  return displayProduct.value?.name || 'Producto'
})

const productCategory = computed(() => {
  return displayProduct.value?.category?.name || 'Sin categoría'
})

const quantity = computed(() => {
  return props.item?.quantity
})

const unit = computed(() => {
  return props.item?.unit
})
</script>

<template>
  <!-- Mode: full - Editable item in list/pantry with quantity controls and delete button -->
  <div 
    v-if="mode === 'full'"
    class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
    :class="{ 'opacity-60': isPurchased }"
  >
    <!-- Imagen del producto (siempre visible) -->
    <div 
      class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
    >
      <img 
        v-if="productImage" 
        :src="productImage" 
        :alt="productName" 
        class="w-full h-full object-cover" 
      />
      <span v-else class="text-2xl">{{ productIcon }}</span>
    </div>

    <!-- Info del producto -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-gray-800 text-base truncate">
        {{ productName }}
      </h4>
      <p class="text-sm text-gray-500 truncate">
        {{ productCategory }}
      </p>
    </div>

    <!-- Unidad -->
    <div class="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-lg">
      <span class="text-sm font-medium text-gray-700">{{ unit }}</span>
    </div>

    <!-- Controles de cantidad -->
    <QuantityControls
      :quantity="quantity || 0"
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

  <!-- Mode: addable - Product available to be added with + button -->
  <div
    v-else-if="mode === 'addable'"
    class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-verde-sidebar transition-all cursor-pointer"
    @click="emit('add')"
  >
    <!-- Product icon/image -->
    <div class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
      <img 
        v-if="productImage" 
        :src="productImage" 
        :alt="productName" 
        class="w-full h-full object-cover" 
      />
      <span v-else class="text-2xl">{{ productIcon }}</span>
    </div>
    
    <!-- Product info -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-gray-800 text-base truncate">
        {{ productName }}
      </h4>
      <p class="text-sm text-gray-500 truncate">
        {{ productCategory }}
      </p>
    </div>
    
    <!-- Add button -->
    <button 
      @click.stop="emit('add')"
      class="flex-shrink-0 w-10 h-10 rounded-full bg-verde-sidebar hover:bg-verde-contraste text-white flex items-center justify-center transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>

  <!-- Mode: readonly - Display only for history (image, name, category, unit, quantity) -->
  <div
    v-else-if="mode === 'readonly'"
    class="flex items-center gap-4 rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-all"
    :class="isPurchased ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'"
  >
    <!-- Estado de compra (if available) -->
    <div v-if="item && 'purchased' in item" class="flex-shrink-0">
      <span v-if="isPurchased" class="text-lg" title="Comprado">✅</span>
      <span v-else class="text-lg" title="No comprado">⬜</span>
    </div>

    <!-- Icono del producto -->
    <div class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
      <img 
        v-if="productImage" 
        :src="productImage" 
        :alt="productName" 
        class="w-full h-full object-cover" 
      />
      <span v-else class="text-2xl">{{ productIcon }}</span>
    </div>

    <!-- Información del producto -->
    <div class="flex-1 min-w-0">
      <h4 
        class="font-semibold text-gray-800 text-base truncate"
        :class="{ 'line-through text-gray-500': item && 'purchased' in item && !item.purchased }"
      >
        {{ productName }}
      </h4>
      <p class="text-sm text-gray-500 truncate">
        {{ productCategory }}
      </p>
    </div>

    <!-- Unidad -->
    <div v-if="unit" class="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-lg">
      <span class="text-sm font-medium text-gray-700">{{ unit }}</span>
    </div>
    
    <!-- Cantidad -->
    <div 
      v-if="quantity"
      class="rounded-lg px-3 py-1" 
      :class="isPurchased ? 'bg-green-100' : 'bg-gray-100'"
    >
      <span 
        class="font-semibold" 
        :class="isPurchased ? 'text-green-700' : 'text-gray-700'"
      >
        {{ quantity }}
      </span>
    </div>
  </div>
</template>
