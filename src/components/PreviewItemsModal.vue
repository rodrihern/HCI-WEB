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
const selectedCategoryId = ref<number | null>(null)

// Items state (unified for both list and pantry)
const listItems = ref<ListItemData[]>([])

// Modal state for adding product details
const showAddProductModal = ref(false)
const selectedProductToAdd = ref<Product | null>(null)

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
  const available = availableProducts.value.filter(product => {
    const productId = product.id
    if (productId === undefined || productId === null) {
      return true
    }
    return !existingProductIds.value.has(productId)
  })

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

const closeModal = () => {
  searchProduct.value = ''
  selectedCategoryId.value = null
  currentItemId.value = null
  listItems.value = []
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
    const itemId = props.itemId
    
    const itemData = {
      product: {
        id: productId
      },
      quantity: quantity,
      unit: unit,
      metadata: {}
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
  
  // Optimistic update: remover del UI inmediatamente
  let removedItem: ListItemData | PantryItem | undefined = undefined
  let removedIndex = -1
  
  if (isListType.value) {
    removedIndex = listItems.value.findIndex(i => i.id === itemId)
    if (removedIndex !== -1) {
      removedItem = { ...listItems.value[removedIndex] } as ListItemData
      listItems.value.splice(removedIndex, 1)
    }
  } else {
    removedIndex = pantryItems.value.findIndex(i => i.id === itemId)
    if (removedIndex !== -1) {
      removedItem = { ...pantryItems.value[removedIndex] } as PantryItem
      pantryItems.value.splice(removedIndex, 1)
    }
  }
  
  try {
    // Eliminar en el servidor en segundo plano
    if (isListType.value) {
      await deleteListItem(props.itemId, itemId)
    } else {
      await deletePantryItem(props.itemId, itemId)
    }
  } catch (error) {
    // Revertir si hay error: restaurar el item eliminado
    if (removedItem && removedIndex !== -1) {
      if (isListType.value) {
        listItems.value.splice(removedIndex, 0, removedItem as ListItemData)
      } else {
        pantryItems.value.splice(removedIndex, 0, removedItem as PantryItem)
      }
    }
    alert('Error al eliminar el producto. Intenta de nuevo.')
  }
}

const incrementQuantity = async (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId) return
  
  // Optimistic update: actualizar UI inmediatamente
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
  
  try {
    // Actualizar en el servidor en segundo plano
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
  } catch (error) {
    console.error('Error updating quantity:', error)
    // Revertir cambio si hay error
    if (isListType.value) {
      const index = listItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        listItems.value[index] = { ...listItems.value[index], quantity: item.quantity } as ListItemData
      }
    } else {
      const index = pantryItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        pantryItems.value[index] = { ...pantryItems.value[index], quantity: item.quantity } as PantryItem
      }
    }
    alert('Error al actualizar la cantidad. Intenta de nuevo.')
  }
}

const decrementQuantity = async (item: ListItemData | PantryItem) => {
  if (!item.id || !props.itemId || item.quantity <= 1) return
  
  // Optimistic update: actualizar UI inmediatamente
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
  
  try {
    // Actualizar en el servidor en segundo plano
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
  } catch (error) {
    console.error('Error updating quantity:', error)
    // Revertir cambio si hay error
    if (isListType.value) {
      const index = listItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        listItems.value[index] = { ...listItems.value[index], quantity: item.quantity } as ListItemData
      }
    } else {
      const index = pantryItems.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        pantryItems.value[index] = { ...pantryItems.value[index], quantity: item.quantity } as PantryItem
      }
    }
    alert('Error al actualizar la cantidad. Intenta de nuevo.')
  }
}

const togglePurchased = async (item: ListItemData) => {
  if (!item.id || !props.itemId || !isListType.value) return
  
  // Optimistic update: actualizar UI inmediatamente
  const index = listItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    listItems.value[index] = { ...listItems.value[index], purchased: !item.purchased } as ListItemData
  }
  
  try {
    // Actualizar en el servidor en segundo plano
    await toggleItemPurchased(props.itemId, item.id, !item.purchased)
  } catch (error) {
    console.error('Error toggling purchased status:', error)
    // Revertir cambio si hay error
    if (index !== -1) {
      listItems.value[index] = { ...listItems.value[index], purchased: item.purchased } as ListItemData
    }
    alert('Error al actualizar el estado. Intenta de nuevo.')
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
          <!-- Productos -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="text-2xl font-bold text-gray-800">Productos</label>
              <span class="text-sm text-gray-500">{{ displayItems.length }} productos</span>
            </div>

            <!-- Filtros de categorías -->
            <div class="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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
