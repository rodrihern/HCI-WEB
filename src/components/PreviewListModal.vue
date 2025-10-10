<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useListsStore } from '@/stores/lists'
import BaseModal from './BaseModal.vue'

const store = useListsStore()
const searchProduct = ref('')

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  searchProduct.value = ''
  emit('close')
}

const currentList = computed(() => store.getPreviewingList())

const addProduct = () => {
  if (searchProduct.value.trim() && currentList.value) {
    // Find or create product
    let product = store.products.find(p => p.name.toLowerCase() === searchProduct.value.toLowerCase())
    if (!product) {
      // Create new product if it doesn't exist
      product = {
        id: Date.now().toString(),
        name: searchProduct.value.trim(),
        category: 'Otros',
        icon: '📦'
      }
      store.addProduct(product)
    }
    
    store.addItemToList(currentList.value.id, product.id, 1, 'unidad')
    searchProduct.value = ''
  }
}

const removeProduct = (productId: string) => {
  if (currentList.value) {
    store.removeItemFromList(currentList.value.id, productId)
  }
}

const incrementQuantity = (productId: string) => {
  if (currentList.value) {
    const item = currentList.value.items.find(i => i.productId === productId)
    if (item) {
      store.updateListItemQuantity(currentList.value.id, productId, item.quantity + 1)
    }
  }
}

const decrementQuantity = (productId: string) => {
  if (currentList.value) {
    const item = currentList.value.items.find(i => i.productId === productId)
    if (item && item.quantity > 1) {
      store.updateListItemQuantity(currentList.value.id, productId, item.quantity - 1)
    }
  }
}



// Mock users for now
const listUsers = ref([
  { id: '1', name: 'Mamá', avatar: '👩' },
  { id: '2', name: 'Papá', avatar: '👨' },
  { id: '3', name: 'Juan', avatar: '👦' }
])

// Mock products for search
const mockProducts = ref([
  { id: '6', name: 'Arroz', category: 'Granos', icon: '🍚' },
  { id: '7', name: 'Aceite', category: 'Condimentos', icon: '🫒' },
  { id: '8', name: 'Huevos', category: 'Lácteos', icon: '🥚' },
  { id: '9', name: 'Pan', category: 'Panadería', icon: '🍞' },
  { id: '10', name: 'Tomate', category: 'Verduras', icon: '🍅' },
  { id: '11', name: 'Cebolla', category: 'Verduras', icon: '🧅' },
  { id: '12', name: 'Pollo', category: 'Carnes', icon: '🍗' },
  { id: '13', name: 'Queso', category: 'Lácteos', icon: '🧀' },
])

const filteredProducts = computed(() => {
  if (!searchProduct.value.trim()) return mockProducts.value
  return mockProducts.value.filter(product => 
    product.name.toLowerCase().includes(searchProduct.value.toLowerCase())
  )
})

// Modal state for adding product with quantity and unit
const showAddProductModal = ref(false)
const selectedProduct = ref<any>(null)
const productQuantity = ref(1)
const productUnit = ref('')
const showUnitDropdown = ref(false)

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

const closeDropdownOnOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.unit-dropdown-container')) {
    showUnitDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick)
})

const addProductFromList = () => {
  if (currentList.value && selectedProduct.value) {
    store.addItemToList(currentList.value.id, selectedProduct.value.id, productQuantity.value, productUnit.value)
    closeAddProductModal()
  }
}
</script>

<template>
  <BaseModal 
    :show="store.isPreviewingList" 
    :title="currentList?.name || 'Vista previa'"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Dos columnas -->
    <div class="flex h-full overflow-hidden">
      <!-- Columna Izquierda - Lista y Productos -->
      <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
        <div class="p-8 overflow-y-auto flex-1">
          <!-- Información de la lista -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="t-heading font-bold text-gray-800">{{ currentList?.name }}</h3>
              <div class="flex items-center gap-2">
                <span class="t-caption text-gray-500">{{ currentList?.items.length }} productos</span>
              </div>
            </div>
            
            <!-- Usuarios de la lista -->
            <div class="mb-6">
              <h4 class="t-body font-semibold text-gray-700 mb-3">Colaboradores</h4>
              <div class="flex items-center gap-2">
                <div 
                  v-for="user in listUsers" 
                  :key="user.id"
                  class="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-gray-200"
                >
                  <span class="t-body">{{ user.avatar }}</span>
                  <span class="t-caption font-medium text-gray-700">{{ user.name }}</span>
                </div>
                <button class="flex items-center justify-center w-8 h-8 bg-verde-sidebar text-white rounded-full hover:bg-verde-contraste transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Productos en la lista -->
          <div>
            <label class="block t-heading font-bold text-gray-800 mb-4">Productos</label>
            
            <div v-if="!currentList?.items.length" class="text-center text-gray-400 py-12">
              <p class="t-body">No hay productos en la lista</p>
              <p class="t-caption mt-2">Busca y agrega productos desde la derecha</p>
            </div>

            <!-- Lista de productos -->
            <div v-else class="space-y-3">
              <div 
                v-for="item in currentList?.items" 
                :key="item.productId"
                class="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm"
              >
                <!-- Producto info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="t-body">{{ store.getProductById(item.productId)?.icon }}</span>
                    <span class="text-gray-800 font-semibold t-body">
                      {{ store.getProductById(item.productId)?.name }}
                    </span>
                    <span class="t-caption text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ item.unit }}</span>
                  </div>
                </div>
                
                <!-- Controles de cantidad -->
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                  <button 
                    @click="decrementQuantity(item.productId)"
                    class="text-gray-600 hover:text-verde-sidebar font-bold t-heading w-8 h-8 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span class="text-gray-800 font-bold min-w-[3rem] text-center t-body">{{ item.quantity }} {{ item.unit }}</span>
                  <button 
                    @click="incrementQuantity(item.productId)"
                    class="text-gray-600 hover:text-verde-sidebar font-bold t-heading w-8 h-8 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <!-- Botón eliminar producto -->
                <button 
                  @click="removeProduct(item.productId)"
                  class="text-red-500 hover:bg-red-50 rounded-xl p-2 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de acción en la columna izquierda -->
        <div class="p-6 bg-gray-50 flex justify-center border-t border-gray-200">
          <button 
            @click="closeModal"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors" 
          >
            Cerrar
          </button>
        </div>
      </div>

      <!-- Columna Derecha - Buscar y Agregar Productos -->
      <div class="w-1/2 flex flex-col bg-white">
        <div class="p-8 pb-6">
          <!-- Buscador de productos -->
          <div class="flex gap-3 items-center mb-6">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                v-model="searchProduct"
                type="text" 
                placeholder="Buscar Productos"
                class="w-full pl-12 pr-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
                @keyup.enter="addProduct"
              />
            </div>
            <button 
              class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          <!-- Tag de producto actual con X y + -->
          <div v-if="searchProduct.trim()" class="flex items-center gap-3 mb-6">
            <div class="flex items-center gap-2 bg-gray-100 rounded-2xl px-5 py-3 flex-1 border-2 border-gray-300">
              <span class="text-gray-800 font-semibold t-body flex-1">{{ searchProduct }}</span>
              <button 
                @click="searchProduct = ''"
                class="text-gray-500 hover:text-gray-700"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button 
              @click="addProduct"
              class="bg-verde-sidebar hover:bg-verde-contraste text-white p-3 rounded-2xl transition-colors shadow-md"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Lista de productos disponibles (scroll) -->
        <div class="flex-1 overflow-y-auto px-8 pb-8">
          <div v-if="filteredProducts.length === 0" class="text-gray-400 text-center py-12">
            <p class="t-body">No se encontraron productos</p>
            <p class="t-caption mt-2">Intenta con otro término de búsqueda</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <span class="text-2xl">{{ product.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-gray-800 font-semibold t-body">{{ product.name }}</span>
                </div>
                <p class="t-caption text-gray-500">{{ product.category }}</p>
              </div>
              <button 
                @click="openAddProductModal(product)"
                class="bg-verde-sidebar text-white p-2 rounded-xl hover:bg-verde-contraste transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Modal para agregar producto con cantidad y unidad -->
  <BaseModal 
    :show="showAddProductModal" 
    title="Agregar Producto"
    max-width="md"
    @close="closeAddProductModal"
  >
    <div class="p-6">
      <div v-if="selectedProduct" class="space-y-6">
        <!-- Producto seleccionado -->
        <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
          <span class="text-3xl">{{ selectedProduct.icon }}</span>
          <div>
            <h3 class="t-heading font-semibold text-gray-800">{{ selectedProduct.name }}</h3>
            <p class="t-caption text-gray-500">{{ selectedProduct.category }}</p>
          </div>
        </div>

        <!-- Cantidad -->
        <div>
          <label class="block t-body font-semibold text-gray-700 mb-2">Cantidad</label>
          <input 
            v-model.number="productQuantity"
            type="number" 
            min="1"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors"
            placeholder="Cantidad"
          />
        </div>

        <!-- Unidad -->
        <div class="relative">
          <label class="block t-body font-semibold text-gray-700 mb-2">Unidad</label>
          <div class="relative unit-dropdown-container">
            <button 
              @click="toggleUnitDropdown"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors bg-white text-left flex items-center justify-between hover:border-gray-400"
              :class="{ 'border-verde-sidebar': showUnitDropdown }"
            >
              <span :class="{ 'text-gray-400': !productUnit }">
                {{ productUnit || 'Select unidad' }}
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
                    class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
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
            @click="addProductFromList"
            :disabled="!productUnit || productQuantity < 1"
            class="flex-1 px-6 py-3 bg-verde-sidebar text-white font-semibold rounded-xl hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
