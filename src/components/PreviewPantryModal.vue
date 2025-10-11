<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import { usePantry } from '@/composables/pantry'
import { useCategory } from '@/composables/category'
import type { PantryItem } from '@/api/pantry'

const props = defineProps<{
  show: boolean
  pantryId?: number
  pantryName?: string
}>()

const emit = defineEmits<{
  close: []
  addProducts: [pantryId: number]
}>()

const { pantryItems, getPantryItems, updatePantryItem, deletePantryItem } = usePantry()
const { categories, getAllCategories } = useCategory()

const showDeleteConfirm = ref(false)
const itemToDelete = ref<number | null>(null)
const isLoading = ref(false)
const selectedCategoryId = ref<number | null>(null)

const closeModal = () => {
  selectedCategoryId.value = null
  emit('close')
}

// Load pantry items and categories when modal opens or pantryId changes
watch(() => [props.show, props.pantryId], async ([show, pantryId]) => {
  if (show && pantryId && typeof pantryId === 'number') {
    isLoading.value = true
    await getPantryItems(pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
    await getAllCategories({ page: 1, limit: 100, orderBy: 'name', order: 'ASC' })
    isLoading.value = false
  }
}, { immediate: true })

// Filter pantry items by selected category
const filteredPantryItems = computed(() => {
  if (!selectedCategoryId.value) return pantryItems.value
  return pantryItems.value.filter(item => 
    item.product.category?.id === selectedCategoryId.value
  )
})

const openAddProductsModal = () => {
  if (props.pantryId) {
    emit('addProducts', props.pantryId)
  }
}

const incrementQuantity = async (item: PantryItem) => {
  if (!props.pantryId || !item.id) return
  await updatePantryItem(props.pantryId, item.id, {
    quantity: item.quantity + 1,
    unit: item.unit,
    metadata: item.metadata
  })
  await getPantryItems(props.pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
}

const decrementQuantity = async (item: PantryItem) => {
  if (!props.pantryId || !item.id) return
  if (item.quantity > 1) {
    await updatePantryItem(props.pantryId, item.id, {
      quantity: item.quantity - 1,
      unit: item.unit,
      metadata: item.metadata
    })
    await getPantryItems(props.pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
  } else {
    confirmDeleteItem(item.id)
  }
}

const confirmDeleteItem = (itemId: number) => {
  itemToDelete.value = itemId
  showDeleteConfirm.value = true
}

const deleteItem = async () => {
  if (itemToDelete.value && props.pantryId) {
    await deletePantryItem(props.pantryId, itemToDelete.value)
    await getPantryItems(props.pantryId, { page: 1, limit: 100, orderBy: 'createdAt', order: 'DESC' })
  }
  showDeleteConfirm.value = false
  itemToDelete.value = null
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="pantryName || 'Despensa'"
    max-width="xl"
    height="90vh"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Una columna -->
    <div class="flex flex-col h-full bg-gray-50">
      <div class="p-6 pb-4 space-y-4">
        <!-- Header con título y botón agregar -->
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-800">Productos</h3>
          <button 
            @click="openAddProductsModal"
            class="flex items-center gap-2 bg-verde-sidebar text-white rounded-xl px-4 py-2.5 hover:bg-verde-contraste transition-colors shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="font-semibold">Agregar</span>
          </button>
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

        <div v-else-if="!filteredPantryItems.length" class="text-center text-gray-400 py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-medium">No hay productos en esta categoría</p>
          <p class="text-sm mt-2">Haz clic en "Agregar" para añadir productos</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="item in filteredPantryItems" 
            :key="item.id"
            class="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <!-- Imagen del producto -->
            <div class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <span class="text-2xl">{{ item.product.metadata?.icon || '📦' }}</span>
            </div>

            <!-- Info del producto -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-800 text-base truncate">
                {{ item.product.name }}
              </h4>
              <p class="text-sm text-gray-500 truncate">
                {{ item.product.category?.name || 'Sin categoría' }}
              </p>
            </div>

            <!-- Controles de cantidad -->
            <QuantityControls
              :quantity="item.quantity"
              @increment="incrementQuantity(item)"
              @decrement="decrementQuantity(item)"
            />
          </div>
        </div>
      </div>

      <!-- Botón Listo -->
      <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-center">
        <button 
          @click="closeModal"
          class="px-8 py-3 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-semibold transition-colors shadow-sm" 
        >
          Listo
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Modal de confirmación para eliminar -->
  <ConfirmationModal
    :show="showDeleteConfirm"
    title="Eliminar producto"
    message="¿Estás seguro de que quieres eliminar este producto de la despensa?"
    variant="danger"
    @confirm="deleteItem"
    @cancel="showDeleteConfirm = false"
  >
    <template #details>
      <p class="text-sm text-gray-600 mt-2">
        Esta acción no se puede deshacer.
      </p>
    </template>
  </ConfirmationModal>
</template>
