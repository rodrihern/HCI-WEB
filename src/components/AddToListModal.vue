<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '@/stores/lists'
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
  productId: string
  productName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const store = useListsStore()
const searchQuery = ref('')

// Filtrar listas según la búsqueda
const filteredLists = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return store.lists
  return store.lists.filter(list => 
    list.name.toLowerCase().includes(query)
  )
})

const closeModal = () => {
  searchQuery.value = ''
  emit('close')
}

const addProductToList = (listId: string) => {
  // Agregar el producto a la lista seleccionada
  store.addItemToList(listId, props.productId, 1)
  closeModal()
}
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Añadir a Lista"
    max-width="2xl"
    height="auto"
    @close="closeModal"
  >
    <div class="flex flex-col h-full bg-gray-50">
      <!-- Buscador -->
      <div class="p-6 pb-4 bg-gray-50">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar Listas"
            class="w-full pl-12 pr-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
          />
        </div>
      </div>

      <!-- Lista de listas disponibles -->
      <div class="flex-1 overflow-y-auto px-6 pb-6">
        <div v-if="filteredLists.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">No se encontraron listas</p>
          <p class="text-sm mt-2">Crea una lista nueva primero</p>
        </div>

        <div v-else class="space-y-3">
          <button
            v-for="list in filteredLists"
            :key="list.id"
            class="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            @click="addProductToList(list.id)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Icono de lista -->
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-verde-claro/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-verde-sidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>

              <!-- Nombre de la lista y cantidad de items -->
              <div class="flex-1 min-w-0 text-left">
                <h3 class="text-gray-800 font-semibold text-lg truncate">{{ list.name }}</h3>
                <p class="text-gray-500 text-sm">
                  {{ list.items.length }} {{ list.items.length === 1 ? 'producto' : 'productos' }}
                </p>
              </div>
            </div>

            <!-- Botón de añadir -->
            <div class="flex-shrink-0 ml-4">
              <div class="w-10 h-10 rounded-full bg-verde-sidebar group-hover:bg-verde-contraste flex items-center justify-center transition-colors">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
