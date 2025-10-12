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
import ConfirmationModal from './ConfirmationModal.vue'
import AddProductModal from './AddProductModal.vue'
import ProductItemCard from './ProductItemCard.vue'

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
const selectedCategoryId = ref<number | null>(null) // For left side (items)
const selectedCategoryIdRight = ref<number | null>(null) // For right side (available products)

// Items state (unified for both list and pantry)
const listItems = ref<ListItemData[]>([])

// Modal state for adding product details
const showAddProductModal = ref(false)
const selectedProductToAdd = ref<Product | null>(null)

// Estado para descartar cambios
const showDiscardConfirm = ref(false)

// Track pending changes (changes not yet saved to server)
interface PendingChange {
  type: 'add' | 'update' | 'delete'
  itemId?: number
  productId?: number
  data?: any
}

const pendingChanges = ref<PendingChange[]>([])
const originalItems = ref<(ListItemData | PantryItem)[]>([])

const hasUnsavedChanges = computed(() => pendingChanges.value.length > 0)

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

// Items for display (unified) with category filter
const displayItems = computed((): (ListItemData | PantryItem)[] => {
  const items = isListType.value ? listItems.value : pantryItems.value
  
  // Apply category filter if selected
  if (selectedCategoryId.value !== null) {
    return items.filter(item => item.product.category?.id === selectedCategoryId.value)
  }
  
  return items
})

const existingProductIds = computed(() => {
  const items = isListType.value ? listItems.value : pantryItems.value

  return new Set(
    items
      .map(item => item.product?.id)
      .filter((id): id is number => typeof id === 'number')
  )
})

// Filter products based on search
const filteredProducts = computed(() => {
  let available = availableProducts.value.filter(product => {
    const productId = product.id
    if (productId === undefined || productId === null) {
      return true
    }
    return !existingProductIds.value.has(productId)
  })

  // Apply category filter for right side
  if (selectedCategoryIdRight.value !== null) {
    available = available.filter(product => product.category?.id === selectedCategoryIdRight.value)
  }

  // Apply search filter
  if (!searchProduct.value.trim()) {
    return available
  }

  const query = searchProduct.value.toLowerCase()
  return available.filter(product => 
    product.name.toLowerCase().includes(query)
  )
})

const itemTypeLabel = computed(() => isListType.value ? 'lista' : 'despensa')
const itemTypeLabelCapitalized = computed(() => isListType.value ? 'Lista' : 'Despensa')

// Load data on mount
onMounted(async () => {
  await loadProducts()
  await loadItems()
  // Load categories for both list and pantry
  await getAllCategories({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
})

// Watch for changes in itemId to reload items
watch(() => [props.show, props.itemId] as const, async (newVal, oldVal) => {
  const [show, itemId] = newVal
  const [oldShow, oldItemId] = oldVal || [false, undefined]
  if (show && itemId && itemId !== oldItemId) {
    await loadItems()
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
      // Save original state for comparison
      originalItems.value = JSON.parse(JSON.stringify(listItems.value))
    } else {
      await getPantryItems(props.itemId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
      // Save original state for comparison
      originalItems.value = JSON.parse(JSON.stringify(pantryItems.value))
    }
    // Reset pending changes when loading new data
    pendingChanges.value = []
  } catch (error) {
    console.error('Error loading items:', error)
    if (isListType.value) {
      listItems.value = []
    }
    originalItems.value = []
  } finally {
    isLoadingItems.value = false
  }
}

const saveAllChanges = async () => {
  if (!props.itemId || pendingChanges.value.length === 0) return

  try {
    // Process all pending changes
    for (const change of pendingChanges.value) {
      if (change.type === 'add') {
        if (isListType.value) {
          await addItemToList(props.itemId, change.data)
        } else {
          await PantryApi.addItem(props.itemId, change.data)
        }
      } else if (change.type === 'update' && change.itemId) {
        if (change.data.purchased !== undefined) {
          // Handle purchased toggle separately
          await toggleItemPurchased(props.itemId, change.itemId, change.data.purchased)
        } else {
          // Handle quantity/unit updates
          if (isListType.value) {
            await updateListItem(props.itemId, change.itemId, change.data)
          } else {
            await updatePantryItem(props.itemId, change.itemId, change.data)
          }
        }
      } else if (change.type === 'delete' && change.itemId) {
        if (isListType.value) {
          await deleteListItem(props.itemId, change.itemId)
        } else {
          await deletePantryItem(props.itemId, change.itemId)
        }
      }
    }

    // Clear pending changes after successful save
    pendingChanges.value = []
    
    // Reload items to get fresh data from server
    await loadItems()
  } catch (error) {
    console.error('Error saving changes:', error)
    throw error
  }
}

const closeModal = () => {
  // Check if there are unsaved changes
  if (hasUnsavedChanges.value) {
    showDiscardConfirm.value = true
    return
  }
  
  // Reset all state and close
  searchProduct.value = ''
  selectedCategoryId.value = null
  selectedCategoryIdRight.value = null
  currentItemId.value = null
  listItems.value = []
  pendingChanges.value = []
  originalItems.value = []
  emit('close')
}

const saveAndClose = async () => {
  if (hasUnsavedChanges.value) {
    try {
      await saveAllChanges()
    } catch (error) {
      alert(`Error al guardar los cambios. Intenta de nuevo.`)
      return
    }
  }
  
  // Reset all state and close
  searchProduct.value = ''
  selectedCategoryId.value = null
  selectedCategoryIdRight.value = null
  currentItemId.value = null
  listItems.value = []
  pendingChanges.value = []
  originalItems.value = []
  emit('close')
}

const discardChanges = () => {
  // Reset all state and close without saving
  searchProduct.value = ''
  selectedCategoryId.value = null
  selectedCategoryIdRight.value = null
  currentItemId.value = null
  listItems.value = []
  pendingChanges.value = []
  originalItems.value = []
  showDiscardConfirm.value = false
  emit('close')
}

// Handle clicking + button on a product
const openAddProductModal = (product: Product) => {
  selectedProductToAdd.value = product
  showAddProductModal.value = true
}

// Handle confirming addition with details
const handleAddProductWithDetails = async (productId: number, quantity: number, unit: string) => {
  if (!props.itemId) {
    return
  }

  isAddingProduct.value = true
  
  try {
    const product = availableProducts.value.find(p => p.id === productId)
    if (!product) {
      alert('Producto no encontrado')
      return
    }

    // Create a temporary item for local display
    const tempItem = {
      id: Date.now(), // temporary ID (negative to distinguish from real IDs)
      product: product,
      quantity: quantity,
      unit: unit,
      metadata: {},
      purchased: false
    }
    
    // Add to local state
    if (isListType.value) {
      listItems.value.push(tempItem as ListItemData)
    } else {
      pantryItems.value.push(tempItem as PantryItem)
    }

    // Track the change
    pendingChanges.value.push({
      type: 'add',
      productId: productId,
      data: {
        product: { id: productId },
        quantity: quantity,
        unit: unit,
        metadata: {}
      }
    })
    
    // Close modal and reset state
    showAddProductModal.value = false
    selectedProductToAdd.value = null
  } catch (error) {
    alert(`Error al agregar el producto a la ${itemTypeLabel.value}. Intenta de nuevo.`)
  } finally {
    isAddingProduct.value = false
  }
}

const removeProduct = (itemId: number | undefined) => {
  if (!itemId || !props.itemId) return
  
  // Remove from local state
  if (isListType.value) {
    const index = listItems.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      listItems.value.splice(index, 1)
    }
  } else {
    const index = pantryItems.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      pantryItems.value.splice(index, 1)
    }
  }
  
  // Track the change (only if it's a real item, not a temporary one)
  if (itemId < 1000000000000) { // Real IDs are smaller than our temporary timestamp IDs
    pendingChanges.value.push({
      type: 'delete',
      itemId: itemId
    })
  } else {
    // If it's a temporary item (just added), remove the 'add' change
    const addIndex = pendingChanges.value.findIndex(
      c => c.type === 'add' && c.data?.product?.id === itemId
    )
    if (addIndex !== -1) {
      pendingChanges.value.splice(addIndex, 1)
    }
  }
}

const incrementQuantity = (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId) return
  
  // Update local state
  if (isListType.value) {
    const index = listItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      listItems.value[index] = { ...listItems.value[index], quantity: item.quantity + 1 } as ListItemData
    }
  } else {
    const index = pantryItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      pantryItems.value[index] = { ...pantryItems.value[index], quantity: item.quantity + 1 } as PantryItem
    }
  }
  
  // Track the change (only for real items)
  if (item.id < 1000000000000) {
    pendingChanges.value.push({
      type: 'update',
      itemId: item.id,
      data: {
        quantity: item.quantity + 1,
        unit: item.unit,
        metadata: item.metadata
      }
    })
  }
}

const decrementQuantity = (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId || item.quantity <= 1) return
  
  // Update local state
  if (isListType.value) {
    const index = listItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      listItems.value[index] = { ...listItems.value[index], quantity: item.quantity - 1 } as ListItemData
    }
  } else {
    const index = pantryItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      pantryItems.value[index] = { ...pantryItems.value[index], quantity: item.quantity - 1 } as PantryItem
    }
  }
  
  // Track the change (only for real items)
  if (item.id < 1000000000000) {
    pendingChanges.value.push({
      type: 'update',
      itemId: item.id,
      data: {
        quantity: item.quantity - 1,
        unit: item.unit,
        metadata: item.metadata
      }
    })
  }
}

const togglePurchased = (item: ListItemData) => {
  if (!item.id || !props.itemId || !isListType.value) return
  
  // Update local state
  const index = listItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    listItems.value[index] = { ...listItems.value[index], purchased: !item.purchased } as ListItemData
  }
  
  // Track the change (only for real items)
  if (item.id < 1000000000000) {
    pendingChanges.value.push({
      type: 'update',
      itemId: item.id,
      data: {
        purchased: !item.purchased
      }
    })
  }
}



</script>

<template>
  <BaseModal 
    :show="show" 
    :title="itemName || 'Vista previa'"
    :contentScrollable="false"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Dos columnas -->
    <div class="flex h-full overflow-hidden">
      <!-- Columna Izquierda - Items -->
      <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
        <div class="p-8 pb-4 flex-shrink-0">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <label class="text-2xl font-bold text-gray-800">Productos</label>
            <span class="text-sm text-gray-500">{{ displayItems.length }} productos</span>
          </div>

          <!-- Filtros de categorías -->
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              @click="selectedCategoryId = null"
              :class="[
                'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
                selectedCategoryId === null
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

        <!-- Scrollable items area -->
        <div class="flex-1 min-h-0 overflow-y-auto px-8 py-4">
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
            <ProductItemCard
              v-for="item in displayItems" 
              :key="item.id"
              :item="item"
              @increment="incrementQuantity(item)"
              @decrement="decrementQuantity(item)"
              @delete="removeProduct(item.id)"
              @toggle-purchased="isListType && togglePurchased(item as ListItemData)"
            />
          </div>
        </div>

        <!-- Botones de acción en la columna izquierda - Fixed at bottom -->
        <div class="p-6 bg-gray-50 flex justify-center items-center border-t border-gray-200 flex-shrink-0">
          <button 
            @click="saveAndClose"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors" 
          >
            Guardar y Salir
          </button>
        </div>
      </div>

      <!-- Columna Derecha - Buscar y Agregar Productos -->
      <div class="w-1/2 flex flex-col bg-white">
        <div class="p-8 pb-4 flex-shrink-0">
          <!-- Buscador de productos -->
          <div class="mb-4">
            <div class="relative">
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
          </div>

          <!-- Filtros de categorías -->
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              @click="selectedCategoryIdRight = null"
              :class="[
                'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
                selectedCategoryIdRight === null
                  ? 'bg-verde-sidebar text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              ]"
            >
              Todos
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectedCategoryIdRight = category.id || null"
              :class="[
                'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
                selectedCategoryIdRight === category.id
                  ? 'bg-verde-sidebar text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              ]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Lista de productos disponibles (scroll) -->
        <div class="flex-1 min-h-0 overflow-y-auto px-8 py-4">
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
            <ProductItemCard
              v-for="product in filteredProducts" 
              :key="product.id"
              :product="product"
              mode="addable"
              @add="openAddProductModal(product)"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Modal de confirmación para descartar cambios -->
  <ConfirmationModal
    :show="showDiscardConfirm"
    title="¿Descartar cambios?"
    message="Tienes cambios sin guardar. ¿Estás seguro de que deseas salir sin guardar?"
    confirmText="Descartar"
    cancelText="Continuar editando"
    @confirm="discardChanges"
    @cancel="showDiscardConfirm = false"
  />

  <!-- Modal para añadir producto con detalles -->
  <AddProductModal
    :show="showAddProductModal"
    mode="enter-details"
    :type="type"
    :productId="selectedProductToAdd?.id"
    :productName="selectedProductToAdd?.name || ''"
    :productImage="selectedProductToAdd?.metadata?.image"
    :productIcon="selectedProductToAdd?.metadata?.icon"
    :productCategory="selectedProductToAdd?.category?.name"
    :pantryId="isPantryType ? itemId : undefined"
    :listId="isListType ? itemId : undefined"
    @close="showAddProductModal = false"
    @add="handleAddProductWithDetails"
  />
</template>
