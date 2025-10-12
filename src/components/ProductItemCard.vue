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
      class="flex-shrink-0 w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors text-gray-400 hover:text-red-500 cursor-pointer"
      title="Eliminar producto"
    >
      <span class="material-icons text-2xl">delete</span>
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
      class="flex-shrink-0 w-10 h-10 rounded-full bg-verde-sidebar hover:bg-verde-contraste hover:cursor-pointer text-white flex items-center justify-center transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>

  <!-- Mode: readonly - Display only for history (image, name, category, unit, quantity) -->
  <div
    v-else-if="mode === 'readonly'"
    class="flex items-center gap-4 rounded-2xl p-4 border-2 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all"
  >
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
      <h4 class="font-semibold text-gray-800 text-base truncate">
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
      class="rounded-lg px-3 py-1 bg-gray-100"
    >
      <span class="font-semibold text-gray-700">
        {{ quantity }}
      </span>
    </div>
  </div>
</template>
