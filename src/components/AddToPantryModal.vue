<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useListsStore } from '../stores/lists'

interface Props {
  show: boolean
  sectionId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  add: [productId: string, quantity: number, sectionId?: string]
}>()

const store = useListsStore()

const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const selectedProduct = ref<string | null>(null)
const quantity = ref(1)

// Obtener categorías únicas
const categories = computed(() => {
  const cats = new Set(store.products.map(p => p.category))
  return ['all', ...Array.from(cats)]
})

// Filtrar productos
const filteredProducts = computed(() => {
  return store.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleAdd = () => {
  if (selectedProduct.value && quantity.value > 0) {
    emit('add', selectedProduct.value, quantity.value, props.sectionId)
    handleClose()
  }
}

const handleClose = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedProduct.value = null
  quantity.value = 1
  emit('close')
}

const selectProduct = (productId: string) => {
  selectedProduct.value = productId
}

// Reset form when modal is opened
watch(() => props.show, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    selectedCategory.value = 'all'
    selectedProduct.value = null
    quantity.value = 1
  }
})
</script>

<template>
  <BaseModal
    :show="show"
    title="Agregar producto a la despensa"
    max-width="3xl"
    height="85vh"
    @close="handleClose"
  >
    <div class="flex flex-col h-full">
      <!-- Buscador y filtro -->
      <div class="px-8 py-6 border-b border-gray-200 space-y-4">
        <!-- Buscador -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar productos..."
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
          />
          <svg class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filtro de categorías -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            class="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors"
            :class="selectedCategory === category
              ? 'bg-verde-sidebar text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          >
            {{ category === 'all' ? 'Todos' : category }}
          </button>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div v-if="filteredProducts.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">No se encontraron productos</p>
          <p class="text-sm">Intenta con otra búsqueda o categoría</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="selectProduct(product.id)"
            class="bg-verde-claro rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md"
            :class="selectedProduct === product.id ? 'ring-2 ring-verde-contraste shadow-md' : ''"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-white/90 flex items-center justify-center flex-shrink-0">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-2xl">{{ product.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold">{{ product.name }}</h3>
                <p class="text-white/80 text-sm">{{ product.category }}</p>
              </div>
              <div v-if="selectedProduct === product.id" class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Control de cantidad y botones de acción -->
      <div class="px-8 py-6 border-t border-gray-200 bg-gray-50">
        <!-- Control de cantidad -->
        <div v-if="selectedProduct" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <div class="flex items-center gap-3">
            <button
              @click="quantity = Math.max(1, quantity - 1)"
              class="bg-white text-verde-sidebar rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold border border-gray-300"
            >
              -
            </button>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              class="w-20 text-center px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-sidebar"
            />
            <button
              @click="quantity++"
              class="bg-white text-verde-sidebar rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold border border-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end gap-3">
          <button
            @click="handleClose"
            class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleAdd"
            :disabled="!selectedProduct || quantity < 1"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
