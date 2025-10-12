<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useListsStore } from '@/stores/lists'
import { ShoppingListApi } from '@/api/shoppingList'
import { useShoppingList } from '@/composables/shoppingList'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useProductStore } from '@/stores/product'
import { useListItem } from '@/composables/listItem'
import { usePantry } from '@/composables/pantry'
import { useCategory } from '@/composables/category'
import { useUser } from '@/composables/user'
import { PantryApi } from '@/api/pantry'
import type { Product } from '@/api/product'
import type { ListItemData } from '@/api/listItem'
import type { PantryItem } from '@/api/pantry'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import AddProductToListDetailsModal from './AddProductToListDetailsModal.vue'

interface ItemUser {
  id: string
  name: string
  avatar: string
  isOwner: boolean
  email?: string
}

type ItemType = 'list' | 'pantry'

const props = defineProps<{
  show: boolean
  itemId?: number
  itemName?: string
  type: ItemType
}>()

const emit = defineEmits<{
  close: []
}>()

// Stores and composables
const listsStore = useListsStore()
const shoppingListStore = useShoppingListStore()
const { getAllShoppingLists } = useShoppingList()
const productStore = useProductStore()
const { addItemToList, getListItems, toggleItemPurchased, deleteListItem, updateListItem } = useListItem()
const { pantryItems, getPantryItems, updatePantryItem, deletePantryItem, pantries } = usePantry()
const { categories, getAllCategories } = useCategory()
const { user } = useUser()

// State
const searchProduct = ref('')
const availableProducts = ref<Product[]>([])
const isLoadingProducts = ref(false)
const isAddingProduct = ref(false)
const isLoadingItems = ref(false)
const currentItemId = ref<number | null>(null)

// Items state (unified for both list and pantry)
const listItems = ref<ListItemData[]>([])

// Modal state for adding product details
const showAddProductModal = ref(false)
const selectedProductToAdd = ref<Product | null>(null)

// Estado para compartir
const showShareInput = ref(false)
const shareEmail = ref('')
const isSharing = ref(false)
const shareError = ref('')
const shareSuccess = ref(false)
const sharedUsers = ref<any[]>([])
const isLoadingSharedUsers = ref(false)

// Estado para eliminar
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// Computed properties
const isListType = computed(() => props.type === 'list')
const isPantryType = computed(() => props.type === 'pantry')

const currentItem = computed(() => {
  if (!props.itemId) return null
  
  if (isListType.value) {
    const listId = parseInt(props.itemId.toString())
    return shoppingListStore.shoppingLists.find(list => list.id === listId) || null
  } else {
    return pantries.value.find(pantry => pantry.id === props.itemId) || null
  }
})

const isCurrentUserOwner = computed(() => {
  if (!currentItem.value?.owner || !user.value?.id) return false
  
  const currentUserId = Number(user.value.id)
  const ownerId = Number(currentItem.value.owner.id)
  
  return currentUserId === ownerId
})

// Items for display (unified)
const displayItems = computed(() => {
  if (isListType.value) {
    return listItems.value
  } else {
    return pantryItems.value
  }
})

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

// Users from the item (owner + shared users)
const itemUsers = computed((): ItemUser[] => {
  if (!currentItem.value) return []
  
  const users: ItemUser[] = []
  
  // Add owner
  if (currentItem.value.owner) {
    const ownerName = currentItem.value.owner.name || 
                     currentItem.value.owner.email?.split('@')[0] || 
                     'Propietario'
    users.push({
      id: currentItem.value.owner.id?.toString() || '',
      name: ownerName,
      avatar: '👤',
      isOwner: true,
      email: currentItem.value.owner.email
    })
  }
  
  // Add shared users
  sharedUsers.value.forEach(user => {
    users.push({
      id: user.id?.toString() || '',
      name: `${user.name || ''} ${user.surname || ''}`.trim() || user.email?.split('@')[0] || 'Usuario',
      avatar: '👥',
      isOwner: false,
      email: user.email
    })
  })
  
  return users
})

const itemTypeLabel = computed(() => isListType.value ? 'lista' : 'despensa')
const itemTypeLabelCapitalized = computed(() => isListType.value ? 'Lista' : 'Despensa')

// Load data on mount
onMounted(async () => {
  await loadProducts()
  await loadItems()
  await loadSharedUsers()
  if (isPantryType.value) {
    await getAllCategories({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
  }
})

// Watch for changes in itemId to reload items
watch(() => [props.show, props.itemId] as const, async (newVal, oldVal) => {
  const [show, itemId] = newVal
  const [oldShow, oldItemId] = oldVal || [false, undefined]
  if (show && itemId && itemId !== oldItemId) {
    await loadItems()
    await loadSharedUsers()
  }
}, { immediate: true })

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

const loadItems = async () => {
  if (!props.itemId) return
  
  // Prevent reloading if we're already loading the same item
  if (currentItemId.value === props.itemId && isLoadingItems.value) {
    return
  }
  
  currentItemId.value = props.itemId
  isLoadingItems.value = true
  
  try {
    if (isListType.value) {
      const result = await getListItems(props.itemId, { limit: 100 })
      listItems.value = result.data || []
    } else {
      await getPantryItems(props.itemId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
    }
  } catch (error) {
    console.error('Error loading items:', error)
    if (isListType.value) {
      listItems.value = []
    }
  } finally {
    isLoadingItems.value = false
  }
}

const loadSharedUsers = async () => {
  if (!props.itemId) return
  
  isLoadingSharedUsers.value = true
  try {
    if (isListType.value) {
      const users = await ShoppingListApi.getSharedUsers(props.itemId)
      sharedUsers.value = users || []
    } else {
      const users = await PantryApi.getSharedUsers(props.itemId)
      sharedUsers.value = users || []
    }
  } catch (error) {
    console.error('Error loading shared users:', error)
    sharedUsers.value = []
  } finally {
    isLoadingSharedUsers.value = false
  }
}

const closeModal = () => {
  searchProduct.value = ''
  showShareInput.value = false
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = false
  currentItemId.value = null
  listItems.value = []
  sharedUsers.value = []
  emit('close')
}

// Handle clicking + button on a product
const openAddProductModal = (product: Product) => {
  selectedProductToAdd.value = product
  showAddProductModal.value = true
}

// Handle confirming addition with details
const handleAddProductWithDetails = async (details: { quantity: number; unit: string; description: string }) => {
  if (!props.itemId || !selectedProductToAdd.value?.id) {
    return
  }

  isAddingProduct.value = true
  
  try {
    const itemId = props.itemId
    const productId = selectedProductToAdd.value.id
    
    const itemData = {
      product: {
        id: productId
      },
      quantity: details.quantity,
      unit: details.unit,
      metadata: details.description ? { description: details.description } : {}
    }
    
    if (isListType.value) {
      await addItemToList(itemId, itemData)
    } else {
      await PantryApi.addItem(itemId, itemData)
    }
    
    // Reload items to show the new item
    await loadItems()
    
    // Close modal and reset state
    showAddProductModal.value = false
    selectedProductToAdd.value = null
  } catch (error) {
    alert(`Error al agregar el producto a la ${itemTypeLabel.value}. Intenta de nuevo.`)
  } finally {
    isAddingProduct.value = false
  }
}

const removeProduct = async (itemId: number | undefined) => {
  if (!itemId || !props.itemId) return
  
  try {
    if (isListType.value) {
      await deleteListItem(props.itemId, itemId)
    } else {
      await deletePantryItem(props.itemId, itemId)
    }
    await loadItems()
  } catch (error) {
    alert('Error al eliminar el producto. Intenta de nuevo.')
  }
}

const incrementQuantity = async (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId) return
  
  try {
    if (isListType.value) {
      await updateListItem(props.itemId, item.id, {
        quantity: item.quantity + 1,
        unit: item.unit,
        metadata: item.metadata
      })
    } else {
      await updatePantryItem(props.itemId, item.id, {
        quantity: item.quantity + 1,
        unit: item.unit,
        metadata: item.metadata
      })
    }
    await loadItems()
  } catch (error) {
    console.error('Error updating quantity:', error)
  }
}

const decrementQuantity = async (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId || item.quantity <= 1) return
  
  try {
    if (isListType.value) {
      await updateListItem(props.itemId, item.id, {
        quantity: item.quantity - 1,
        unit: item.unit,
        metadata: item.metadata
      })
    } else {
      await updatePantryItem(props.itemId, item.id, {
        quantity: item.quantity - 1,
        unit: item.unit,
        metadata: item.metadata
      })
    }
    await loadItems()
  } catch (error) {
    console.error('Error updating quantity:', error)
  }
}

const togglePurchased = async (item: ListItemData) => {
  if (!item.id || !props.itemId || !isListType.value) return
  
  try {
    await toggleItemPurchased(props.itemId, item.id, !item.purchased)
    await loadItems()
  } catch (error) {
    console.error('Error toggling purchased status:', error)
  }
}

// Funcionalidad de compartir
const toggleShareInput = () => {
  showShareInput.value = !showShareInput.value
  shareEmail.value = ''
  shareError.value = ''
  shareSuccess.value = false
}

const shareItem = async () => {
  if (!props.itemId || !shareEmail.value.trim()) {
    shareError.value = 'Por favor ingresa un email válido'
    return
  }

  isSharing.value = true
  shareError.value = ''
  shareSuccess.value = false

  try {
    if (isListType.value) {
      await ShoppingListApi.share(props.itemId, shareEmail.value.trim())
    } else {
      await PantryApi.share(props.itemId, shareEmail.value.trim())
    }
    shareSuccess.value = true
    shareEmail.value = ''
    
    // Refresh shared users list
    await loadSharedUsers()
    
    // Ocultar mensaje de éxito después de 2 segundos
    setTimeout(() => {
      shareSuccess.value = false
      showShareInput.value = false
    }, 2000)
  } catch (error: any) {
    shareError.value = error.message || `Error al compartir la ${itemTypeLabel.value}. Intenta de nuevo.`
  } finally {
    isSharing.value = false
  }
}

const revokeShare = async (userId: number) => {
  if (!props.itemId || !isCurrentUserOwner.value) {
    alert('No tienes permisos para revocar accesos.')
    return
  }
  
  try {
    if (isListType.value) {
      await ShoppingListApi.revokeShare(props.itemId, userId)
    } else {
      await PantryApi.revokeShare(props.itemId, userId)
    }
    // Refresh shared users list
    await loadSharedUsers()
  } catch (error) {
    console.error('Error revoking share:', error)
    alert('Error al revocar el acceso. Intenta de nuevo.')
  }
}

// Funcionalidad de eliminar
const confirmDeleteItem = () => {
  showDeleteConfirm.value = true
}

const deleteItem = async () => {
  if (!props.itemId || !isCurrentUserOwner.value) {
    alert(`No tienes permisos para eliminar esta ${itemTypeLabel.value}.`)
    return
  }

  isDeleting.value = true

  try {
    if (isListType.value) {
      await ShoppingListApi.remove(props.itemId)
      await getAllShoppingLists()
    } else {
      await PantryApi.remove(props.itemId)
      // Reload page for pantry
      window.location.reload()
    }
    showDeleteConfirm.value = false
    closeModal()
  } catch (error: any) {
    alert(`Error al eliminar la ${itemTypeLabel.value}. Intenta de nuevo.`)
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
    :show="show" 
    :title="itemName || 'Vista previa'"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Dos columnas -->
    <div class="flex h-full overflow-hidden">
      <!-- Columna Izquierda - Items -->
      <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
        <div class="p-8 overflow-y-auto flex-1">
          <!-- Información del item -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800">{{ itemName }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ displayItems.length }} productos</span>
              </div>
            </div>
            
            <!-- Usuarios -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-700 mb-3">Colaboradores</h4>
              <div class="flex items-center gap-2 flex-wrap">
                <div 
                  v-for="user in itemUsers" 
                  :key="user.id"
                  class="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-gray-200 cursor-pointer"
                  :title="user.isOwner ? 'Propietario' : 'Colaborador'"
                >
                  <span class="text-lg">{{ user.avatar }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
                  <span 
                    v-if="user.isOwner" 
                    class="text-xs bg-verde-sidebar text-white px-2 py-1 rounded-full font-medium"
                  >
                    Propietario
                  </span>
                  <button 
                    v-if="!user.isOwner && isCurrentUserOwner"
                    @click="revokeShare(parseInt(user.id))"
                    class="text-gray-400 hover:text-red-500 ml-1"
                    title="Revocar acceso"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button 
                  v-if="isCurrentUserOwner"
                  @click="toggleShareInput"
                  class="flex items-center justify-center w-8 h-8 bg-verde-sidebar text-white rounded-full hover:bg-verde-contraste transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <!-- Input para compartir -->
              <div v-if="showShareInput && isCurrentUserOwner" class="mt-4">
                <div class="flex gap-2">
                  <input 
                    v-model="shareEmail"
                    type="email" 
                    placeholder="Email del colaborador"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-verde-sidebar focus:outline-none"
                    @keyup.enter="shareItem"
                  />
                  <button 
                    @click="shareItem"
                    :disabled="isSharing || !shareEmail.trim()"
                    class="px-4 py-2 bg-verde-sidebar text-white rounded-lg hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSharing ? 'Compartiendo...' : 'Compartir' }}
                  </button>
                </div>
                <p v-if="shareError" class="text-red-500 text-sm mt-2">{{ shareError }}</p>
                <p v-if="shareSuccess" class="text-green-600 text-sm mt-2">¡{{ itemTypeLabelCapitalized }} compartida exitosamente!</p>
              </div>
            </div>
          </div>

          <!-- Productos -->
          <div>
            <label class="block text-2xl font-bold text-gray-800 mb-4">Productos</label>
            
            <!-- Loading state -->
            <div v-if="isLoadingItems" class="text-center text-gray-400 py-12">
              <p class="text-lg">Cargando productos...</p>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="displayItems.length === 0" class="text-center text-gray-400 py-12">
              <p class="text-lg">No hay productos en la {{ itemTypeLabel }}</p>
              <p class="text-sm mt-2">Busca y agrega productos desde la derecha</p>
            </div>
            
            <!-- Items -->
            <div v-else class="space-y-3">
              <div 
                v-for="item in displayItems" 
                :key="item.id"
                class="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm"
                :class="{ 'opacity-60': isListType && 'purchased' in item && item.purchased }"
              >
                <!-- Checkbox for purchased status (only for lists) -->
                <button 
                  v-if="isListType && 'purchased' in item"
                  @click="togglePurchased(item as ListItemData)"
                  class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="item.purchased ? 'bg-verde-sidebar border-verde-sidebar text-white' : 'border-gray-300 hover:border-verde-sidebar'"
                >
                  <svg v-if="item.purchased" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Imagen del producto (only for pantry) -->
                <div v-if="isPantryType" class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <span class="text-2xl">{{ item.product.metadata?.icon || '📦' }}</span>
                </div>
                
                <!-- Product info -->
                <div class="flex-1 min-w-0">
                  <p class="text-gray-800 font-semibold text-base truncate">{{ item.product.name }}</p>
                  <p v-if="item.product.category" class="text-gray-500 text-sm">{{ item.product.category.name }}</p>
                  <p v-if="item.metadata?.description" class="text-gray-400 text-xs mt-1">{{ item.metadata.description }}</p>
                </div>
                
                <!-- Quantity controls -->
                <div class="flex items-center gap-2">
                  <button 
                    @click="decrementQuantity(item)"
                    :disabled="item.quantity <= 1"
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span class="text-gray-800 font-semibold text-lg min-w-[2rem] text-center">{{ item.quantity }}</span>
                  
                  <button 
                    @click="incrementQuantity(item)"
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <!-- Unit -->
                <span class="text-gray-500 text-sm font-medium">{{ item.unit }}</span>
                
                <!-- Delete button -->
                <button 
                  @click="removeProduct(item.id)"
                  class="text-red-500 hover:bg-red-50 rounded-xl p-2 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
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
            v-if="isCurrentUserOwner"
            @click="confirmDeleteItem"
            class="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors" 
          >
            Eliminar {{ itemTypeLabelCapitalized }}
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
              <!-- Product icon/image -->
              <div class="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <span class="text-xl">{{ product.metadata?.icon || '📦' }}</span>
              </div>
              
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

  <!-- Modal de confirmación de eliminación -->
  <ConfirmationModal
    :show="showDeleteConfirm"
    :title="`¿Eliminar ${itemTypeLabel}?`"
    :message="`¿Estás seguro de que deseas eliminar ${isListType ? 'la lista' : 'la despensa'} '${itemName}'? Esta acción no se puede deshacer.`"
    confirmText="Eliminar"
    cancelText="Cancelar"
    @confirm="deleteItem"
    @cancel="cancelDelete"
    :isProcessing="isDeleting"
  />

  <!-- Modal para añadir producto con detalles -->
  <AddProductToListDetailsModal
    :show="showAddProductModal"
    :productName="selectedProductToAdd?.name || ''"
    :productId="selectedProductToAdd?.id"
    :productImage="selectedProductToAdd?.metadata?.image"
    :productIcon="selectedProductToAdd?.metadata?.icon"
    :productCategory="selectedProductToAdd?.category?.name"
    :isLoading="isAddingProduct"
    @close="showAddProductModal = false"
    @confirm="handleAddProductWithDetails"
  />
</template>
