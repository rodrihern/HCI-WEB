<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import PageHeader from '@/components/PageHeader.vue'

const store = useListsStore()
const animatingFavorites = ref<Set<string>>(new Set())
const searchProduct = ref('')

const sortedLists = computed(() => {
  return [...store.lists].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
})

const addNewList = () => {
  store.openCreateListModal()
}

const closeModal = () => {
  searchProduct.value = ''
  store.closeCreateListModal()
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
    // Aquí podrías agregar lógica para asociar productos a la lista
    closeModal()
  }
}

const deleteList = (id: string) => {
  if (confirm('¿Estás seguro de eliminar esta lista?')) {
    store.deleteList(id)
  }
}

const toggleFavoriteWithAnimation = (id: string) => {
  // Agregar animación
  animatingFavorites.value.add(id)
  
  // Esperar un momento antes de cambiar el estado para que se vea la animación
  setTimeout(() => {
    store.toggleFavorite(id)
    
    // Remover de animación después de que termine
    setTimeout(() => {
      animatingFavorites.value.delete(id)
    }, 200)
  }, 200)
}
</script>


<template>
<div class="flex items-center gap-2">
  <button class="px-2 py-1 text-xs bg-gray-200 rounded" @click="for (let i=0;i<50;i++) store.addList('Demo ' + (i+1))">
    +50
  </button>
  <button class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded" @click="store.lists = []">
    Clear
  </button>
</div>

  <div class="py-6 px-6 relative min-h-full">
    <PageHeader 
      title="Mis listas" 
      :onAddClick="addNewList"
      :showFilter="true"
    />

    <div class="space-y-3 pb-20">
      <transition-group name="list-move">
        <div
          v-for="list in sortedLists"
          :key="list.id"
          class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          :class="{ 'scale-[1.02] shadow-lg': animatingFavorites.has(list.id) }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-white font-semibold text-lg">{{ list.name }}</h3>
              </div>
              <p class="text-white text-sm opacity-90">Creada por Mamá</p>
            </div>
            <button
              @click="toggleFavoriteWithAnimation(list.id)"
              class="relative p-2 hover:scale-110 transition-transform duration-200"
              :class="{ 'favorite-pulse': animatingFavorites.has(list.id) }"
            >
              <!-- Filled Star (Favorite) -->
              <svg 
                v-if="list.isFavorite"
                class="w-7 h-7 text-yellow-300 transition-all duration-200"
                :class="{ 'favorite-bounce': animatingFavorites.has(list.id) }"
                stroke="currentColor"
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <!-- Outline Star (Not Favorite) -->
              <svg 
                v-else
                class="w-7 h-7 text-white opacity-60 hover:opacity-100 transition-all duration-200"
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <div v-if="sortedLists.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes listas todavía</p>
      <p class="text-sm">Haz clic en el botón + para crear una</p>
    </div>
  </div>

  <!-- Modal para crear nueva lista -->
  <transition name="modal-fade">
    <div 
      v-if="store.isCreatingList" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex flex-col">
        <!-- Header del Modal -->
        <div class="bg-[#FEFFF7] px-8 py-5 flex items-center justify-center border-b border-gray-200 relative">
          <button 
            @click="closeModal"
            class="absolute left-8 text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-2xl font-bold text-gray-800">Nueva Lista</h2>
        </div>

        <!-- Contenido del Modal - Dos columnas -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Columna Izquierda - Nombre y Productos de la Lista -->
          <div class="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
            <div class="p-8 overflow-y-auto flex-1">
              <!-- Input para el nombre de la lista -->
              <div class="mb-8">
                <label class="block text-2xl font-bold text-gray-800 mb-3">Nombre</label>
                <input 
                  v-model="store.newListName"
                  type="text" 
                  placeholder="Nombre de la lista"
                  class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-[#68AE6F] focus:outline-none transition-colors text-gray-800 bg-white"
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
                        class="text-gray-600 hover:text-[#68AE6F] font-bold text-xl w-8 h-8 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span class="text-gray-800 font-bold min-w-[3rem] text-center text-lg">{{ product.quantity }}</span>
                      <button 
                        @click="incrementQuantity(index)"
                        class="text-gray-600 hover:text-[#68AE6F] font-bold text-xl w-8 h-8 flex items-center justify-center"
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
                class="bg-[#68AE6F] hover:bg-[#5a9860] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl px-16 py-4 rounded-full transition-colors shadow-lg hover:shadow-xl"
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
                    class="w-full pl-12 pr-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-[#68AE6F] focus:outline-none transition-colors text-gray-800"
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
                  class="bg-[#68AE6F] hover:bg-[#5a9860] text-white p-3 rounded-2xl transition-colors shadow-md"
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
      </div>
    </div>
  </transition>
</template>
