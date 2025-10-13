<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'
import UnitSelector from './UnitSelector.vue'
import { useProduct } from '@/composables/product'
import { useCategory } from '@/composables/category'
import { useShoppingList } from '@/composables/shoppingList'
import { usePantry } from '@/composables/pantry'
import type { ProductData } from '@/api/product'

type Mode = 'select-product' | 'select-destination' | 'enter-details'
type DestinationType = 'pantry' | 'list'

interface Props {
  show: boolean
  // Mode: select-product shows product list, select-destination shows lists/pantries, enter-details shows quantity/unit form
  mode?: Mode
  // Type: pantry or list
  type?: DestinationType
  // If mode is 'enter-details' or 'select-destination', provide the product info
  productId?: number
  productName?: string
  productImage?: string
  productIcon?: string
  productCategory?: string
  // If mode is 'select-product' and type is 'pantry', provide pantry/section ID
  pantryId?: number
  sectionId?: string
  // If mode is 'select-product' and type is 'list', provide list ID
  listId?: number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'select-product',
  type: 'list'
})

const emit = defineEmits<{
  close: []
  add: [productId: number, quantity: number, unit: string, destinationId?: number, sectionId?: string]
}>()

// Composables
const { products, getAllProducts } = useProduct()
const { categories: allCategories, getAllCategories } = useCategory()
const { shoppingLists } = useShoppingList()
const { pantries } = usePantry()

// State
const searchQuery = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedProduct = ref<ProductData | null>(null)
const selectedDestinationId = ref<number | null>(null)
const showDestinationDetails = ref(false) // Para mostrar solo la lista seleccionada
const quantity = ref(1)
const unit = ref('unidad')
const isLoading = ref(false)

// Computed
const modalTitle = computed(() => {
  if (props.mode === 'select-product') {
    return props.type === 'pantry' ? 'Agregar producto a la despensa' : 'Agregar producto a la lista'
  } else if (props.mode === 'select-destination') {
    return props.type === 'pantry' ? 'Seleccionar despensa' : 'Seleccionar lista'
  } else {
    return 'Detalles del producto'
  }
})

const categories = computed(() => {
  return [
    { id: null, name: 'Todos' },
    ...allCategories.value
  ]
})

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (product.category?.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategoryId.value === null || product.category_id === selectedCategoryId.value
    return matchesSearch && matchesCategory
  })
})

const destinations = computed(() => {
  if (props.type === 'pantry') {
    return pantries.value
  } else {
    return shoppingLists.value
  }
})

const filteredDestinations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return destinations.value
  return destinations.value.filter(dest => 
    dest.name.toLowerCase().includes(query)
  )
})

const selectedDestination = computed(() => {
  if (!selectedDestinationId.value) return null
  return destinations.value.find(dest => dest.id === selectedDestinationId.value)
})

const currentProduct = computed(() => {
  if (props.mode === 'enter-details' && props.productId) {
    return {
      id: props.productId,
      name: props.productName || '',
      image: props.productImage,
      icon: props.productIcon,
      category: props.productCategory
    }
  }
  
  // Extract image/icon from metadata for selectedProduct
  if (selectedProduct.value) {
    return {
      id: selectedProduct.value.id,
      name: selectedProduct.value.name,
      image: selectedProduct.value.metadata?.image as string | undefined,
      icon: selectedProduct.value.metadata?.icon as string | undefined,
      category: selectedProduct.value.category?.name
    }
  }
  
  return null
})

// Methods
const handleClose = () => {
  searchQuery.value = ''
  selectedCategoryId.value = null
  selectedProduct.value = null
  selectedDestinationId.value = null
  showDestinationDetails.value = false
  quantity.value = 1
  unit.value = 'unidad'
  emit('close')
}

const selectProduct = (product: ProductData) => {
  selectedProduct.value = product
  
  // If we have a direct destination (pantryId or listId), go to details
  if (props.pantryId || props.listId) {
    // Mode will remain 'select-product' but we'll show details section
  }
}

const selectDestination = (destinationId: number) => {
  selectedDestinationId.value = destinationId
  showDestinationDetails.value = true
}

const backToDestinationList = () => {
  selectedDestinationId.value = null
  showDestinationDetails.value = false
}

const handleAdd = () => {
  const productId = currentProduct.value?.id
  const destinationId = selectedDestinationId.value || props.pantryId || props.listId
  
  if (productId && quantity.value > 0) {
    emit('add', productId, quantity.value, unit.value, destinationId, props.sectionId)
    handleClose()
  }
}

const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}



// Load data when modal opens
watch(() => props.show, async (show) => {
  if (show) {
    isLoading.value = true
    if (props.mode === 'select-product') {
      await getAllProducts({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
      await getAllCategories({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
    }
    isLoading.value = false
    
    // Reset form
    quantity.value = 1
    unit.value = 'unidad'
    searchQuery.value = ''
    selectedCategoryId.value = null
    selectedProduct.value = null
    selectedDestinationId.value = null
    showDestinationDetails.value = false
  }
})
</script>

<template>
  <BaseModal
    :show="show"
    :title="modalTitle"
    :max-width="mode === 'enter-details' ? 'xl' : '3xl'"
    :height="mode === 'enter-details' ? 'auto' : '85vh'"
    @close="handleClose"
  >
    <!-- Mode: select-product - Show product list with search and categories -->
    <div v-if="mode === 'select-product'" class="flex flex-col h-full">
      <!-- Search and filters -->
      <div class="px-8 py-6 border-b border-gray-200 space-y-4">
        <!-- Search bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar productos..."
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
          />
          <svg class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Category filters -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="category in categories"
            :key="category.id ?? 'all'"
            @click="selectedCategoryId = category.id ?? null"
            class="px-4 py-2 rounded-full hover:cursor-pointer font-medium whitespace-nowrap transition-colors"
            :class="selectedCategoryId === category.id
              ? 'bg-verde-sidebar text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Product list -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div v-if="isLoading" class="text-center text-gray-500 py-12">
          <p class="text-lg">Cargando productos...</p>
        </div>
        
        <div v-else-if="filteredProducts.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">No se encontraron productos</p>
          <p class="text-sm">Intenta con otra búsqueda o categoría</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="selectProduct(product)"
            class="bg-verde-claro rounded-xl hover:cursor-pointer p-4 text-left transition-all duration-200 hover:shadow-md"
            :class="selectedProduct?.id === product.id ? 'ring-2 ring-verde-contraste shadow-md' : ''"
          >
            <div class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold">{{ product.name }}</h3>
                <p class="text-white/80 text-sm">{{ product.category?.name || 'Sin categoría' }}</p>
              </div>
              <div v-if="selectedProduct?.id === product.id" class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Quantity controls and action buttons (show when product is selected) -->
      <div v-if="selectedProduct" class="px-8 py-6 border-t border-gray-200 bg-gray-50">
        <!-- Quantity control -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <div class="w-fit">
            <QuantityControls
              :quantity="quantity"
              @increment="incrementQuantity"
              @decrement="decrementQuantity"
            />
          </div>
        </div>

        <!-- Unit selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Unidad
          </label>
          <UnitSelector v-model="unit" />
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-3">
          <button
            @click="handleClose"
            class="px-6 py-2.5 rounded-xl bg-gray-200 hover:cursor-pointer hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleAdd"
            :disabled="!selectedProduct || quantity < 1"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:cursor-pointer hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>

    <!-- Mode: select-destination - Show list of pantries or lists -->
    <div v-else-if="mode === 'select-destination'" class="flex flex-col h-full bg-gray-50">
      <!-- Product info -->
      <div v-if="currentProduct" class="p-6 pb-4 bg-white border-b border-gray-200">
        <div class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <!-- Imagen del producto -->
          <div class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              v-if="currentProduct.image" 
              :src="currentProduct.image" 
              :alt="currentProduct.name" 
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl">{{ currentProduct.icon || '📦' }}</span>
          </div>
          
          <!-- Info del producto -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 text-base truncate">{{ currentProduct.name }}</h4>
            <p class="text-sm text-gray-500 truncate">{{ currentProduct.category || 'Sin categoría' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Show selected destination with back button -->
      <div v-if="showDestinationDetails && selectedDestination" class="p-6 pb-4 bg-gray-50 border-b border-gray-200">
        <button 
          @click="backToDestinationList"
          class="flex items-center gap-2 text-verde-sidebar hover:cursor-pointer hover:text-verde-contraste font-medium mb-4 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Cambiar {{ type === 'pantry' ? 'despensa' : 'lista' }}
        </button>
        
        <div class="bg-white rounded-2xl p-5 border-2 border-verde-sidebar shadow-md">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 text-lg">{{ selectedDestination.name }}</h3>
            </div>
            <div class="ml-4">
              <svg class="w-6 h-6 text-verde-sidebar" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Search bar (only show when not showing details) -->
      <div v-if="!showDestinationDetails" class="p-6 pb-4 bg-gray-50">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="type === 'pantry' ? 'Buscar Despensas' : 'Buscar Listas'"
            class="w-full pl-12 pr-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
          />
        </div>
      </div>

      <!-- List of destinations (only show when not showing details) -->
      <div v-if="!showDestinationDetails" class="flex-1 overflow-y-auto px-6 pb-6">
        <div v-if="filteredDestinations.length === 0" class="text-center text-gray-400 py-12">
          <p class="text-lg">No se encontraron {{ type === 'pantry' ? 'despensas' : 'listas' }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-3">
          <button
            v-for="destination in filteredDestinations"
            :key="destination.id"
            @click="selectDestination(destination.id!)"
            class="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:cursor-pointer hover:border-verde-sidebar transition-all text-left shadow-sm hover:shadow-md"
            :class="selectedDestinationId === destination.id ? 'ring-2 ring-verde-contraste border-verde-sidebar' : ''"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800 text-lg">{{ destination.name }}</h3>
              </div>
              <div v-if="selectedDestinationId === destination.id" class="ml-4">
                <svg class="w-6 h-6 text-verde-sidebar" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Action buttons (show when destination is selected and showing details) -->
      <div v-if="showDestinationDetails && selectedDestinationId" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <!-- Quantity control -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <div class="w-fit">
            <QuantityControls
              :quantity="quantity"
              @increment="incrementQuantity"
              @decrement="decrementQuantity"
            />
          </div>
        </div>

        <!-- Unit selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Unidad
          </label>
          <UnitSelector v-model="unit" />
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="handleClose"
            class="px-6 py-2.5 rounded-xl bg-gray-200 hover:cursor-pointer hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleAdd"
            :disabled="!selectedDestinationId || quantity < 1"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:cursor-pointer hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>

    <!-- Mode: enter-details - Show quantity and unit form only -->
    <div v-else-if="mode === 'enter-details'" class="p-6">
      <!-- Product info -->
      <div v-if="currentProduct" class="mb-6">
        <div class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <!-- Imagen del producto -->
          <div class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              v-if="currentProduct.image" 
              :src="currentProduct.image" 
              :alt="currentProduct.name" 
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl">{{ currentProduct.icon || '📦' }}</span>
          </div>
          
          <!-- Info del producto -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 text-base truncate">{{ currentProduct.name }}</h4>
            <p class="text-sm text-gray-500 truncate">{{ currentProduct.category || 'Sin categoría' }}</p>
          </div>
        </div>
      </div>

      <!-- Quantity control -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cantidad
        </label>
        <div class="w-fit">
          <QuantityControls
            :quantity="quantity"
            @increment="incrementQuantity"
            @decrement="decrementQuantity"
          />
        </div>
      </div>

      <!-- Unit selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Unidad
        </label>
        <UnitSelector v-model="unit" />
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-6 py-2.5 rounded-xl hover:cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleAdd"
          :disabled="quantity < 1"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:cursor-pointer over:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
