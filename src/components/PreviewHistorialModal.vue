<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '@/stores/lists'
import { usePurchaseStore } from '@/stores/purchase'
import BaseModal from './BaseModal.vue'

const store = useListsStore()
const purchaseStore = usePurchaseStore()

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  emit('close')
}

const currentHistorial = computed(() => {
  if (!store.previewingHistorialId) return null
  return purchaseStore.purchases.find(p => p.id === store.previewingHistorialId)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getProductIcon = (categoryName: string) => {
  const categoryIcons: Record<string, string> = {
    'Frutas': '🍌',
    'Lácteos': '🥛',
    'Bakery': '🍞',
    'Verduras': '🥬',
    'Carnes': '🍗',
    'Snacks': '🥔',
    'Galletas': '🍪'
  }
  return categoryIcons[categoryName] || '📦'
}

// Group products by month
const productsByMonth = computed(() => {
  if (!currentHistorial.value) return {}
  
  const grouped: Record<string, any[]> = {}
  
  currentHistorial.value.listItemArray.forEach(item => {
    const dateStr = item.lastPurchasedAt || item.createdAt || currentHistorial.value?.createdAt
    if (!dateStr) return
    
    const date = new Date(dateStr)
    const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    grouped[monthKey].push(item)
  })
  
  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })
  
  const sortedGrouped: Record<string, any[]> = {}
  sortedMonths.forEach(month => {
    sortedGrouped[month] = grouped[month] || []
  })
  
  return sortedGrouped
})
</script>

<template>
  <BaseModal 
    :show="store.isPreviewingHistorial" 
    :title="currentHistorial?.list.name || 'Historial de Compra'"
    max-width="2xl"
    height="80vh"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Panel único -->
    <div class="flex flex-col h-full">
      <!-- Header con información básica -->
      <div class="p-6 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xl font-bold text-gray-800">{{ currentHistorial?.list.name }}</h3>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>{{ currentHistorial?.listItemArray.length }} productos</span>
            <span>{{ currentHistorial?.listItemArray.filter(i => i.purchased).length }} comprados</span>
          </div>
        </div>
        <p v-if="currentHistorial?.list.description" class="text-gray-600 text-sm">
          {{ currentHistorial.list.description }}
        </p>
      </div>

      <!-- Contenido principal - Productos agrupados por mes -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="!currentHistorial?.listItemArray.length" class="text-center text-gray-400 py-12">
          <p class="text-lg">No hay productos en esta compra</p>
        </div>

        <!-- Productos agrupados por mes -->
        <div v-else class="space-y-6">
          <div v-for="(items, month) in productsByMonth" :key="month" class="space-y-3">
            <!-- Header del mes -->
            <div class="flex items-center gap-3 mb-4">
              <h4 class="text-lg font-semibold text-gray-700">{{ month }}</h4>
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-sm text-gray-500">{{ items.length }} productos</span>
            </div>

            <!-- Lista de productos del mes -->
            <div class="space-y-2">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <!-- Icono del producto -->
                <span class="text-lg">{{ getProductIcon(item.product.category.name) }}</span>

                <!-- Información del producto -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-800 font-medium">
                      {{ item.product.name }}
                    </span>
                    <div class="relative group">
                      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full cursor-help">{{ item.unit }}</span>
                      <!-- Tooltip -->
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        unidad
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500">{{ item.product.category.name }}</div>
                </div>
                
                <!-- Cantidad -->
                <div class="bg-gray-100 rounded-lg px-3 py-1">
                  <span class="text-gray-800 font-semibold">{{ item.quantity }}</span>
                </div>

                <!-- Fecha específica -->
                <div class="text-xs text-gray-500 text-right min-w-[80px]">
                  {{ formatDate(item.lastPurchasedAt || item.createdAt) }}
                </div>
              </div>
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
