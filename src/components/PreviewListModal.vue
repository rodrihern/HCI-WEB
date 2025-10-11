<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '@/stores/lists'
import { ShoppingListApi } from '@/api/shoppingList'
import { useShoppingList } from '@/composables/shoppingList'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'
import ConfirmationModal from './ConfirmationModal.vue'

const store = useListsStore()
const { getAllShoppingLists } = useShoppingList()
const searchProduct = ref('')

// Estado para compartir
const showShareInput = ref(false)
const shareEmail = ref('')
const isSharing = ref(false)
const shareError = ref('')
const shareSuccess = ref(false)

// Estado para eliminar
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  searchProduct.value = ''
  showShareInput.value = false
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = false
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



// Users from the list (owner + shared users)
const listUsers = computed(() => {
  if (!currentList.value) return []
  
  // TODO: Get actual shared users from API
  // For now, just show owner
  return [
    { id: '1', name: 'Yo', avatar: '👤', isOwner: true }
  ]
})

// Funcionalidad de compartir
const toggleShareInput = () => {
  showShareInput.value = !showShareInput.value
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = false
}

const shareList = async () => {
  if (!currentList.value?.id || !shareEmail.value.trim()) {
    shareError.value = 'Por favor ingresa un email válido'
    return
  }

  isSharing.value = true
  shareError.value = ''
  shareSuccess.value = false

  try {
    const listId = parseInt(currentList.value.id)
    await ShoppingListApi.share(listId, shareEmail.value.trim())
    shareSuccess.value = true
    shareEmail.value = ''
    
    // Ocultar mensaje de éxito después de 2 segundos
    setTimeout(() => {
      shareSuccess.value = false
      showShareInput.value = false
    }, 2000)
  } catch (error: any) {
    console.error('Error sharing list:', error)
    shareError.value = error.message || 'Error al compartir la lista. Intenta de nuevo.'
  } finally {
    isSharing.value = false
  }
}

// Funcionalidad de eliminar
const confirmDeleteList = () => {
  showDeleteConfirm.value = true
}

const deleteList = async () => {
  if (!currentList.value?.id) return

  isDeleting.value = true

  try {
    const listId = parseInt(currentList.value.id)
    await ShoppingListApi.remove(listId)
    await getAllShoppingLists()
    showDeleteConfirm.value = false
    closeModal()
  } catch (error: any) {
    console.error('Error deleting list:', error)
    alert('Error al eliminar la lista. Intenta de nuevo.')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
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
              <h3 class="text-xl font-bold text-gray-800">{{ currentList?.name }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ currentList?.items.length }} productos</span>
              </div>
            </div>
            
            <!-- Usuarios de la lista -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-700 mb-3">Colaboradores</h4>
              <div class="flex items-center gap-2 flex-wrap">
                <div 
                  v-for="user in listUsers" 
                  :key="user.id"
                  class="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-gray-200"
                >
                  <span class="text-lg">{{ user.avatar }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
                </div>
                <button 
                  @click="toggleShareInput"
                  class="flex items-center justify-center w-8 h-8 bg-verde-sidebar text-white rounded-full hover:bg-verde-contraste transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <!-- Input para compartir -->
              <div v-if="showShareInput" class="mt-4">
                <div class="flex gap-2">
                  <input 
                    v-model="shareEmail"
                    type="email" 
                    placeholder="Email del colaborador"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-verde-sidebar focus:outline-none"
                    @keyup.enter="shareList"
                  />
                  <button 
                    @click="shareList"
                    :disabled="isSharing || !shareEmail.trim()"
                    class="px-4 py-2 bg-verde-sidebar text-white rounded-lg hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSharing ? 'Compartiendo...' : 'Compartir' }}
                  </button>
                </div>
                <p v-if="shareError" class="text-red-500 text-sm mt-2">{{ shareError }}</p>
                <p v-if="shareSuccess" class="text-green-600 text-sm mt-2">¡Lista compartida exitosamente!</p>
              </div>
            </div>
          </div>

          <!-- Productos en la lista -->
          <div>
            <label class="block text-2xl font-bold text-gray-800 mb-4">Productos</label>
            
            <div v-if="!currentList?.items.length" class="text-center text-gray-400 py-12">
              <p class="text-lg">No hay productos en la lista</p>
              <p class="text-sm mt-2">Busca y agrega productos desde la derecha</p>
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
                    <span class="text-lg">{{ store.getProductById(item.productId)?.icon }}</span>
                    <span class="text-gray-800 font-semibold text-lg">
                      {{ store.getProductById(item.productId)?.name }}
                    </span>
                    <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ item.unit }}</span>
                  </div>
                </div>
                
                <QuantityControls
                  :quantity="item.quantity"
                  @increment="incrementQuantity(item.productId)"
                  @decrement="decrementQuantity(item.productId)"
                />

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

        <!-- Botones de acción en la columna izquierda -->
        <div class="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
          <button 
            @click="confirmDeleteList"
            class="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors" 
          >
            Eliminar Lista
          </button>
          <button 
            @click="closeModal"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors" 
          >
            Guardar y Salir
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
          <div class="text-gray-400 text-center py-12">
            <p class="text-lg">Busca productos para agregarlos</p>
            <p class="text-sm mt-2">Los productos se mostrarán aquí</p>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Modal de confirmación de eliminación -->
  <ConfirmationModal
    :show="showDeleteConfirm"
    title="¿Eliminar lista?"
    :message="`¿Estás seguro de que deseas eliminar la lista '${currentList?.name}'? Esta acción no se puede deshacer.`"
    confirmText="Eliminar"
    cancelText="Cancelar"
    @confirm="deleteList"
    @cancel="cancelDelete"
    :isProcessing="isDeleting"
  />
</template>
