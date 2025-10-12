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

const onRestore = async () => {
  if (!currentHistorial.value?.id) return
  
  try {
    await purchaseStore.restore(currentHistorial.value.id)
    
    // Eliminar la compra del store
    purchaseStore.removePurchase(currentHistorial.value.id)
    
    // Cerrar el modal
    closeModal()
    
    alert('Lista restaurada exitosamente')
  } catch (error) {
    console.error('Error restoring purchase:', error)
    alert('Error al restaurar la lista')
  }
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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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
  if (!currentHistorial.value || !currentHistorial.value.listItemArray) return {}
  
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

const purchasedItemsCount = computed(() => {
  return currentHistorial.value?.listItemArray?.filter(i => i.purchased).length || 0
})

const totalItemsCount = computed(() => {
  return currentHistorial.value?.listItemArray?.length || 0
})

const purchaseOwner = computed(() => {
  const owner = currentHistorial.value?.owner
  if (!owner) return ''
  return `${owner.name} ${owner.surname}`
})
</script>

<template>
  <BaseModal 
    :show="store.isPreviewingHistorial" 
    :title="`Compra: ${currentHistorial?.list.name || 'Historial de Compra'}`"
    max-width="2xl"
    height="80vh"
    @close="closeModal"
  >
    <!-- Contenido del Modal - Panel único -->
    <div class="flex flex-col h-full">
      <!-- Header con información básica -->
      <div class="p-6 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-bold text-gray-800">{{ currentHistorial?.list.name }}</h3>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span class="bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              {{ purchasedItemsCount }}/{{ totalItemsCount }} comprados
            </span>
          </div>
        </div>
        
        <!-- Información de la compra -->
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-gray-600">
            <span class="font-medium">📅 Fecha de compra:</span>
            <span>{{ currentHistorial?.createdAt ? formatDateTime(currentHistorial.createdAt) : 'N/A' }}</span>
          </div>
          
          <div class="flex items-center gap-2 text-gray-600">
            <span class="font-medium">👤 Comprado por:</span>
            <span>{{ purchaseOwner || 'N/A' }}</span>
          </div>
          
          <div v-if="currentHistorial?.list.description" class="flex items-start gap-2 text-gray-600">
            <span class="font-medium">📝 Descripción:</span>
            <span>{{ currentHistorial.list.description }}</span>
          </div>
        </div>
      </div>

      <!-- Contenido principal - Productos agrupados por mes -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="!currentHistorial?.listItemArray || currentHistorial.listItemArray.length === 0" class="text-center text-gray-400 py-12">
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

            <!-- Lista de productos del mes -->
            <div class="space-y-2">
              <div 
                v-for="item in currentHistorial.listItemArray" 
                :key="item.id"
                class="flex items-center gap-3 rounded-xl p-3 border transition-colors"
                :class="item.purchased ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'"
              >
                <!-- Estado de compra -->
                <div class="flex-shrink-0">
                  <span v-if="item.purchased" class="text-lg" title="Comprado">✅</span>
                  <span v-else class="text-lg" title="No comprado">⬜</span>
                </div>

                <!-- Icono del producto -->
                <span class="text-lg">{{ item.product?.category ? getProductIcon(item.product.category.name) : '📦' }}</span>

                <!-- Información del producto -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-800 font-medium" :class="{ 'line-through text-gray-500': !item.purchased }">
                      {{ item.product.name }}
                    </span>
                    <div class="relative group">
                      <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full cursor-help border border-gray-200">{{ item.unit }}</span>
                      <!-- Tooltip -->
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        unidad
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                  <div v-if="item.product?.category" class="text-xs text-gray-500">{{ item.product.category.name }}</div>
                </div>
                
                <!-- Cantidad -->
                <div class="rounded-lg px-3 py-1" :class="item.purchased ? 'bg-green-100' : 'bg-gray-100'">
                  <span class="font-semibold" :class="item.purchased ? 'text-green-700' : 'text-gray-700'">{{ item.quantity }}</span>
                </div>

                <!-- Fecha específica de compra si existe -->
                <div v-if="item.lastPurchasedAt" class="text-xs text-gray-500 text-right min-w-[80px]">
                  {{ formatShortDate(item.lastPurchasedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de acción -->
      <div class="p-6 border-t border-gray-200 bg-gray-50 flex justify-center gap-3">
        <button 
          @click="onRestore"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors" 
        >
          Restaurar Lista
        </button>
        <button 
          @click="closeModal"
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors" 
        >
          Cerrar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
