<script setup lang="ts">
import { ref } from 'vue'
import { useListsStore } from '@/stores/lists'
import BaseModal from './BaseModal.vue'

const store = useListsStore()
const searchProduct = ref('')

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  searchProduct.value = ''
  emit('close')
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

const createList = () => {
  if (store.newListName.trim()) {
    store.addList(store.newListName.trim())
    closeModal()
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
      <!-- Columna Izquierda - Nombre y Productos de la Lista -->
      <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
        <div class="p-8 overflow-y-auto flex-1">
          <!-- Input para el nombre de la lista -->
          <div class="mb-8">
            <input 
              v-model="store.newListName"
              type="text" 
              placeholder="Nombre de la lista"
              class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
            />
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
                <span class="flex-1 text-gray-800 font-semibold text-lg">{{ product.name }}</span>
                
                <!-- Controles de cantidad -->
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                  <button 
                    @click="decrementQuantity(index)"
                    class="text-gray-600 hover:text-verde-sidebar font-bold text-xl w-8 h-8 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span class="text-gray-800 font-bold min-w-[3rem] text-center text-lg">{{ product.quantity }}</span>
                  <button 
                    @click="incrementQuantity(index)"
                    class="text-gray-600 hover:text-verde-sidebar font-bold text-xl w-8 h-8 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

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

        <!-- Botón Listo en la columna izquierda -->
        <div class="p-6 bg-gray-50 flex justify-center border-t border-gray-200">
          <button 
            @click="createList"
            :disabled="!store.newListName.trim()"
            class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          >
            Listo
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
            <p class="text-lg">Busca productos para agregarlos a tu lista</p>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
