<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useListsStore } from '@/stores/lists'
import { usePurchaseStore } from '@/stores/purchase'
import { ListItemApi, type ListItemData } from '@/api/listItem'
import BaseModal from './BaseModal.vue'
import ProductItemCard from './ProductItemCard.vue'
import type { Purchase } from '@/api/purchase'

const store = useListsStore()
const purchaseStore = usePurchaseStore()

const emit = defineEmits<{
  close: []
}>()

const currentHistorial = ref<Purchase | null>(null)
const listItems = ref<ListItemData[]>([])
const isLoading = ref(false)

// Watch for changes in the previewing ID
watch(() => store.previewingHistorialId, async (newId) => {
  if (newId) {
    isLoading.value = true
    try {
      // Cargar el purchase completo desde la API
      currentHistorial.value = await purchaseStore.get(newId)
      
      // Obtener los items de la lista usando el ID de la lista
      if (currentHistorial.value?.list?.id) {
        const response = await ListItemApi.getAll(
          currentHistorial.value.list.id,
          undefined,
          {
            limit: 100,
            orderBy: 'createdAt',
            order: 'ASC'
          }
        )
        listItems.value = response.data
      }
    } catch (error) {
      console.error('Error loading purchase details:', error)
    } finally {
      isLoading.value = false
    }
  } else {
    currentHistorial.value = null
    listItems.value = []
  }
}, { immediate: true })

const closeModal = () => {
  currentHistorial.value = null
  listItems.value = []
  emit('close')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const totalItemsCount = computed(() => {
  return listItems.value.length
})

const formattedDate = computed(() => {
  if (!currentHistorial.value?.createdAt) return 'N/A'
  return formatDateTime(currentHistorial.value.createdAt)
})
</script>

<template>
  <BaseModal 
    :show="store.isPreviewingHistorial" 
    :title="`${currentHistorial?.list.name || 'Historial de Compra'}`"
    max-width="2xl"
    height="80vh"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Panel único -->
    <div class="flex flex-col h-full">
  <!-- Header con información básica (ahora como sección estilizada similar a Productos) -->
  <div class="p-6 pb-3">
        <div class="space-y-3">
          <div class="flex items-center gap-3 mb-4">
            <h4 class="text-lg font-semibold text-gray-700">Información de la compra</h4>
            <div class="flex-1 h-px bg-gray-200"></div>
            <span class="text-sm text-gray-500">{{ formattedDate }}</span>
          </div>

          <!-- Descripción eliminada -->
        </div>
      </div>

  <!-- Contenido principal - Productos agrupados por mes -->
  <div class="flex-1 overflow-y-auto pt-0 px-6 pb-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center text-gray-400 py-12">
          <p class="text-lg">Cargando productos...</p>
        </div>

        <!-- No products state -->
        <div v-else-if="listItems.length === 0" class="text-center text-gray-400 py-12">
          <p class="text-lg">No hay productos en esta compra</p>
          <p class="text-sm mt-2">Esta compra no contiene productos registrados</p>
        </div>

        <!-- Productos del purchase -->
        <div v-else class="space-y-6">
          <div class="space-y-3">
            <!-- Header de la sección -->
            <div class="flex items-center gap-3 mb-4">
              <h4 class="text-lg font-semibold text-gray-700">Productos de esta compra</h4>
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-sm text-gray-500">{{ totalItemsCount }} productos</span>
            </div>

            <!-- Lista de productos -->
            <div class="space-y-2">
              <ProductItemCard
                v-for="item in listItems" 
                :key="item.id"
                :item="item"
                mode="readonly"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de acción -->
      <div class="p-6 border-t border-gray-200 bg-gray-50 flex justify-center">
        <button 
          @click="closeModal"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors" 
        >
          Cerrar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
