<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useListsStore } from '@/stores/lists'
import { useShoppingList } from '@/composables/shoppingList'
import { ShoppingListApi } from '@/api/shoppingList'
import type { ShoppingListData } from '@/api/shoppingList'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/api/product'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'
import AddProductToListDetailsModal from './AddProductToListDetailsModal.vue'

const store = useListsStore()
const { getAllShoppingLists } = useShoppingList()
const productStore = useProductStore()
const searchProduct = ref('')
const isCreating = ref(false)
const emailToShare = ref('')
const showShareInput = ref(false)
const availableProducts = ref<Product[]>([])
const isLoadingProducts = ref(false)

// Modal state for adding product details
const showAddProductModal = ref(false)
const selectedProductToAdd = ref<Product | null>(null)

// Collaborators with email tracking
const collaborators = ref<Array<{ id: string, name: string, avatar: string, isOwner: boolean, email?: string }>>([
  { id: '1', name: 'Yo', avatar: '👤', isOwner: true }
])

const emit = defineEmits<{
  close: []
}>()

// Load products from API
onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  isLoadingProducts.value = true
  try {
    await productStore.getAll(undefined, { limit: 100 })
    availableProducts.value = productStore.products
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    isLoadingProducts.value = false
  }
}

const closeModal = () => {
  searchProduct.value = ''
  emailToShare.value = ''
  showShareInput.value = false
  // Reset collaborators to just the owner
  collaborators.value = [{ id: '1', name: 'Yo', avatar: '👤', isOwner: true }]
  store.closeCreateListModal()
  emit('close')
}

// Filter products based on search
const filteredProducts = computed(() => {
  if (!searchProduct.value.trim()) {
    return availableProducts.value
  }
  const query = searchProduct.value.toLowerCase()
  return availableProducts.value.filter(product => 
    product.name.toLowerCase().includes(query)
  )
})

// Handle clicking + button on a product
const openAddProductModal = (product: Product) => {
  selectedProductToAdd.value = product
  showAddProductModal.value = true
}

// Handle confirming addition with details
const handleAddProductWithDetails = (details: { quantity: number; unit: string; description: string }) => {
  // Modal functionality - no API integration yet
  if (selectedProductToAdd.value) {
    store.newListProducts.push({
      name: selectedProductToAdd.value.name,
      quantity: details.quantity,
      unit: details.unit,
      description: details.description,
      id: selectedProductToAdd.value.id
    } as any)
  }
  showAddProductModal.value = false
  selectedProductToAdd.value = null
}

const addProduct = () => {
  if (searchProduct.value.trim()) {
    store.addProductToNewList(searchProduct.value)
    searchProduct.value = ''
  }
}

const removeProduct = (index: number) => {
  store.removeProductFromNewList(index)
}

const incrementQuantity = (index: number) => {
  const product = store.newListProducts[index]
  if (product) {
    store.updateNewListProductQuantity(index, product.quantity + 1)
  }
}

const decrementQuantity = (index: number) => {
  const product = store.newListProducts[index]
  if (product && product.quantity > 1) {
    store.updateNewListProductQuantity(index, product.quantity - 1)
  }
}

const toggleShareInput = () => {
  showShareInput.value = !showShareInput.value
}

const shareList = () => {
  if (emailToShare.value.trim()) {
    // Add to collaborators temporarily with email stored
    const email = emailToShare.value.trim()
    const newCollaborator = {
      id: Date.now().toString(),
      name: email.split('@')[0] || email,
      avatar: '👥',
      isOwner: false,
      email: email
    }
    collaborators.value.push(newCollaborator)
    emailToShare.value = ''
    showShareInput.value = false
  }
}

const removeCollaborator = (id: string) => {
  collaborators.value = collaborators.value.filter(c => c.id !== id)
}

const createList = async () => {
  if (!store.newListName.trim()) return
  
  isCreating.value = true
  
  try {
    const newList: Partial<ShoppingListData> = {
      name: store.newListName.trim(),
      description: 'Nueva lista',
      recurring: false,
      metadata: {}
    }
    
    // Import the API and store
    const { useShoppingListStore } = await import('@/stores/shoppingList')
    const shoppingListStore = useShoppingListStore()
    
    const createdList = await shoppingListStore.add(newList)
    
    // Share list with collaborators if any (excluding owner)
    const collaboratorsToShare = collaborators.value.filter(c => !c.isOwner && c.email)
    for (const collab of collaboratorsToShare) {
      try {
        await ShoppingListApi.share(createdList.id!, collab.email!)
      } catch (error) {
        console.error(`Error sharing list with ${collab.email}:`, error)
        // Continue with other collaborators even if one fails
      }
    }
    
    await getAllShoppingLists()
    
    closeModal()
  } catch (error) {
    console.error('Error creating list:', error)
    alert('Error al crear la lista. Por favor intenta de nuevo.')
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <BaseModal 
    :show="store.isCreatingList" 
    title="Nueva Lista"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Dos columnas -->
    <div class="flex h-full overflow-hidden">
      <!-- Columna Izquierda - Lista y Productos -->
      <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
        <div class="p-8 overflow-y-auto flex-1">
          <!-- Información de la lista -->
          <div class="mb-6">
            <!-- Input para el nombre de la lista -->
            <div class="mb-4">
              <input 
                v-model="store.newListName"
                type="text" 
                placeholder="Nombre de la lista"
                class="w-full px-5 py-4 text-xl font-bold border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
              />
            </div>
            
            <!-- Colaboradores -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-700 mb-3">Colaboradores</h4>
              <div class="flex items-center gap-2 flex-wrap">
                <div 
                  v-for="user in collaborators" 
                  :key="user.id"
                  class="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-gray-200"
                >
                  <span class="text-lg">{{ user.avatar }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
                  <button 
                    v-if="!user.isOwner"
                    @click="removeCollaborator(user.id)"
                    class="text-gray-400 hover:text-red-500 ml-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <!-- Botón para agregar colaborador -->
                <button 
                  @click="toggleShareInput"
                  class="flex items-center justify-center w-8 h-8 bg-verde-sidebar text-white rounded-full hover:bg-verde-contraste transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <!-- Input para compartir por email -->
              <transition
                enter-active-class="transition-all duration-200"
                leave-active-class="transition-all duration-200"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
              >
                <div v-if="showShareInput" class="mt-3">
                  <div class="flex gap-2">
                    <input 
                      v-model="emailToShare"
                      type="email"
                      placeholder="Email del colaborador"
                      class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
                      @keyup.enter="shareList"
                    />
                    <button 
                      @click="shareList"
                      :disabled="!emailToShare.trim()"
                      class="px-4 py-2 bg-verde-sidebar text-white rounded-xl hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Productos en la lista -->
          <div>
            <label class="block text-2xl font-bold text-gray-800 mb-4">Productos</label>
            
            <div v-if="store.newListProducts.length === 0" class="text-center text-gray-400 py-12">
              <p class="text-lg">No hay productos en la lista</p>
              <p class="text-sm mt-2">Busca y agrega productos desde la derecha</p>
            </div>

            <!-- Lista de productos agregados -->
            <div v-else class="space-y-3">
              <div 
                v-for="(product, index) in store.newListProducts" 
                :key="index"
                class="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm"
              >
                <!-- Producto info -->
                <div class="flex-1">
                  <span class="text-gray-800 font-semibold text-lg">{{ product.name }}</span>
                </div>
                
                <QuantityControls
                  :quantity="product.quantity"
                  @increment="incrementQuantity(index)"
                  @decrement="decrementQuantity(index)"
                />

                <!-- Botón eliminar producto -->
                <button 
                  @click="removeProduct(index)"
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
            @click="createList"
            :disabled="!store.newListName.trim() || isCreating"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          >
            {{ isCreating ? 'Creando...' : 'Crear Lista' }}
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
                class="w-full pl-12 pr-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
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
              <span class="text-gray-800 font-semibold text-lg flex-1">{{ searchProduct }}</span>
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
          <!-- Loading state -->
          <div v-if="isLoadingProducts" class="text-center text-gray-400 py-12">
            <p class="text-lg">Cargando productos...</p>
          </div>

          <!-- Empty state when no products -->
          <div v-else-if="filteredProducts.length === 0" class="text-center text-gray-400 py-12">
            <p class="text-lg">No se encontraron productos</p>
            <p class="text-sm mt-2">{{ searchProduct ? 'Intenta con otra búsqueda' : 'No hay productos disponibles' }}</p>
          </div>

          <!-- Products grid -->
          <div v-else class="grid grid-cols-1 gap-3">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-verde-sidebar transition-colors"
            >
              <!-- Product info -->
              <div class="flex-1 min-w-0">
                <p class="text-gray-800 font-semibold text-base truncate">{{ product.name }}</p>
                <p v-if="product.category" class="text-gray-500 text-sm">{{ product.category.name }}</p>
              </div>
              
              <!-- Add button -->
              <button 
                @click="openAddProductModal(product)"
                class="flex-shrink-0 w-10 h-10 rounded-full bg-verde-sidebar hover:bg-verde-contraste text-white flex items-center justify-center transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Modal para añadir producto con detalles -->
  <AddProductToListDetailsModal
    :show="showAddProductModal"
    :productName="selectedProductToAdd?.name || ''"
    :productId="selectedProductToAdd?.id"
    @close="showAddProductModal = false"
    @confirm="handleAddProductWithDetails"
  />
</template>
