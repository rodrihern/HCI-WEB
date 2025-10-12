<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import AddProductToListDetailsModal from './AddProductToListDetailsModal.vue'
import { usePantry } from '@/composables/pantry'
import { useProduct } from '@/composables/product'
import { useCategory } from '@/composables/category'

const props = defineProps<{
  show: boolean
  pantryId?: number
  pantryName?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { addItemToPantry, getPantryItems } = usePantry()
const { products, getAllProducts } = useProduct()
const { categories, getAllCategories } = useCategory()

const searchProduct = ref('')
const selectedCategoryId = ref<number | null>(null)
const isLoading = ref(false)

// Modal for adding product with quantity and unit
const showAddProductDetailsModal = ref(false)
const selectedProduct = ref<any>(null)
const isAddingProduct = ref(false)

// Success message
const showSuccessMessage = ref(false)
const successProductName = ref('')

const closeModal = () => {
  searchProduct.value = ''
  selectedCategoryId.value = null
  emit('close')
}

// Load products and categories when modal opens
watch(() => props.show, async (show) => {
  if (show) {
    isLoading.value = true
    await getAllProducts({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
    await getAllCategories({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
    isLoading.value = false
  }
}, { immediate: true })

// Filter products by search and category
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by search
  if (searchProduct.value.trim()) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchProduct.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategoryId.value) {
    filtered = filtered.filter(product => 
      product.category?.id === selectedCategoryId.value
    )
  }

  return filtered
})

const openAddProductDetailsModal = (product: any) => {
  selectedProduct.value = product
  showAddProductDetailsModal.value = true
}

const closeAddProductDetailsModal = () => {
  showAddProductDetailsModal.value = false
  selectedProduct.value = null
}

const handleAddProductWithDetails = async (details: { quantity: number; unit: string; description: string }) => {
  if (!props.pantryId || !selectedProduct.value) return

  isAddingProduct.value = true
  
  try {
    await addItemToPantry(props.pantryId, {
      product: {
        id: selectedProduct.value.id
      },
      quantity: details.quantity,
      unit: details.unit,
      metadata: details.description ? { description: details.description } : {}
    })
    
    // Refresh pantry items
    await getPantryItems(props.pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
    
    // Show success message
    successProductName.value = selectedProduct.value.name
    showSuccessMessage.value = true
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
    closeAddProductDetailsModal()
  } catch (error) {
    console.error('Error adding product to pantry:', error)
    alert('Error al agregar el producto a la despensa. Intenta de nuevo.')
  } finally {
    isAddingProduct.value = false
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="'Agregar Productos'"
    max-width="xl"
    height="90vh"
    @close="closeModal"
  >
    <!-- Contenido del Modal -->
    <div class="flex flex-col h-full bg-white">
      <div class="p-6 pb-4 space-y-4">
        <!-- Buscador -->
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchProduct"
            type="text" 
            placeholder="Buscar productos..."
            class="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
          />
        </div>

        <!-- Filtros de categorías -->
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="selectedCategoryId = null"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              !selectedCategoryId 
                ? 'bg-verde-sidebar text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            ]"
          >
            Todos
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategoryId = category.id || null"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedCategoryId === category.id
                ? 'bg-verde-sidebar text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="flex-1 overflow-y-auto px-6 pb-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-sidebar"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredProducts.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">No se encontraron productos</p>
          <p class="text-sm mt-2">Intenta con otros términos de búsqueda</p>
        </div>

        <!-- Products grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="openAddProductDetailsModal(product)"
            class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div class="flex items-center gap-3">
              <!-- Product icon -->
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <span class="text-2xl">{{ product.metadata?.icon || '📦' }}</span>
              </div>

              <!-- Product info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-gray-800 font-semibold text-sm truncate">{{ product.name }}</h3>
                <p class="text-gray-500 text-xs">{{ product.category?.name || 'Sin categoría' }}</p>
              </div>

              <!-- Add button -->
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-verde-sidebar group-hover:bg-verde-contraste flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Success message -->
    <div v-if="showSuccessMessage" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ successProductName }} agregado exitosamente</span>
      </div>
    </div>
  </BaseModal>

  <!-- Modal para agregar producto con detalles -->
  <AddProductToListDetailsModal
    :show="showAddProductDetailsModal"
    :product-name="selectedProduct?.name || ''"
    :product-id="selectedProduct?.id"
    :is-loading="isAddingProduct"
    @close="closeAddProductDetailsModal"
    @confirm="handleAddProductWithDetails"
  />
</template>