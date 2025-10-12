<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
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
const showAddProductModal = ref(false)
const selectedProduct = ref<any>(null)
const productQuantity = ref(1)
const productUnit = ref('')
const showUnitDropdown = ref(false)

// Success message
const showSuccessMessage = ref(false)
const successProductName = ref('')

// Available units
const availableUnits = ref([
  'kg',
  'lts',
  'unidad',
  'docena',
  'paquete',
  'caja',
  'bolsa',
  'botella',
  'lata',
  'gramos',
  'ml'
])

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

const openAddProductModal = (product: any) => {
  selectedProduct.value = product
  productQuantity.value = 1
  productUnit.value = ''
  showUnitDropdown.value = false
  showAddProductModal.value = true
}

const closeAddProductModal = () => {
  showAddProductModal.value = false
  selectedProduct.value = null
  productQuantity.value = 1
  productUnit.value = ''
  showUnitDropdown.value = false
}

const selectUnit = (unit: string) => {
  productUnit.value = unit
  showUnitDropdown.value = false
}

const toggleUnitDropdown = () => {
  showUnitDropdown.value = !showUnitDropdown.value
}

const addProductToPantry = async () => {
  if (props.pantryId && selectedProduct.value && productUnit.value) {
    const productName = selectedProduct.value.name
    
    await addItemToPantry(props.pantryId, {
      product: {
        id: selectedProduct.value.id
      },
      quantity: productQuantity.value,
      unit: productUnit.value,
      metadata: {}
    })
    
    // Refresh pantry items
    await getPantryItems(props.pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
    closeAddProductModal()
    
    // Show success message
    successProductName.value = productName
    showSuccessMessage.value = true
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
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
      <div class="flex-1 overflow-y-auto px-6">
        <div v-if="isLoading" class="text-center text-gray-400 py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-verde-sidebar mb-4"></div>
          <p class="text-lg">Cargando productos...</p>
        </div>

        <div v-else-if="!filteredProducts.length" class="text-center text-gray-400 py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-medium">No se encontraron productos</p>
          <p class="text-sm mt-2">Intenta con otro término de búsqueda</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
            @click="openAddProductModal(product)"
          >
            <!-- Imagen del producto -->
            <div class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <span class="text-2xl">{{ product.metadata?.icon || '📦' }}</span>
            </div>

            <!-- Info del producto -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-800 text-base truncate">
                {{ product.name }}
              </h4>
              <p class="text-sm text-gray-500 truncate">
                {{ product.category?.name || 'Sin categoría' }}
              </p>
            </div>

            <!-- Botón agregar -->
            <button 
              class="flex-shrink-0 bg-verde-sidebar text-white p-2.5 rounded-xl hover:bg-verde-contraste transition-colors shadow-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Botón Cancelar -->
      <div class="p-6 bg-white border-t border-gray-200 flex justify-center">
        <button 
          @click="closeModal"
          class="px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors" 
        >
          Volver
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Modal para agregar producto con cantidad y unidad -->
  <BaseModal 
    :show="showAddProductModal" 
    title="Agregar Producto"
    max-width="md"
    height="auto"
    @close="closeAddProductModal"
  >
    <div class="p-6">
      <div v-if="selectedProduct" class="space-y-6">
        <!-- Producto seleccionado -->
        <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
          <span class="text-3xl">{{ selectedProduct.metadata?.icon || '📦' }}</span>
          <div>
            <h3 class="text-xl font-semibold text-gray-800">{{ selectedProduct.name }}</h3>
            <p class="text-sm text-gray-500">{{ selectedProduct.category?.name || 'Sin categoría' }}</p>
          </div>
        </div>

        <!-- Cantidad -->
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">Cantidad</label>
          <input 
            v-model.number="productQuantity"
            type="number" 
            min="1"
            class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors"
            placeholder="Cantidad"
          />
        </div>

        <!-- Unidad -->
        <div class="relative">
          <label class="block text-lg font-semibold text-gray-700 mb-2">Unidad</label>
          <div class="relative unit-dropdown-container">
            <button 
              @click="toggleUnitDropdown"
              class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors bg-white text-left flex items-center justify-between hover:border-gray-400"
              :class="{ 'border-verde-sidebar': showUnitDropdown }"
            >
              <span :class="{ 'text-gray-400': !productUnit }">
                {{ productUnit || 'Seleccionar unidad' }}
              </span>
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': showUnitDropdown }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 scale-95 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-2"
            >
              <div 
                v-if="showUnitDropdown"
                class="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                <div class="py-2">
                  <button
                    v-for="unit in availableUnits"
                    :key="unit"
                    @click="selectUnit(unit)"
                    class="w-full px-4 py-3 text-left text-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                    :class="{ 'bg-verde-sidebar/10 text-verde-sidebar': productUnit === unit }"
                  >
                    <span>{{ unit }}</span>
                    <svg 
                      v-if="productUnit === unit"
                      class="w-5 h-5 text-verde-sidebar"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-3 pt-4">
          <button 
            @click="closeAddProductModal"
            class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="addProductToPantry"
            :disabled="!productUnit || productQuantity < 1"
            class="flex-1 px-6 py-3 bg-verde-sidebar text-white font-semibold rounded-xl hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Success Message Toast -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div 
      v-if="showSuccessMessage"
      class="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
    >
      <div class="bg-verde-sidebar text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-lg">¡Producto agregado!</p>
          <p class="text-white/90 text-sm">{{ successProductName }} se agregó a la despensa</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
