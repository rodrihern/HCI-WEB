<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()
const animatingFavorites = ref<Set<string>>(new Set())

const sortedLists = computed(() => {
  return [...store.lists].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
})

const addNewList = () => {
  const name = prompt('Nombre de la nueva lista:')
  if (name) {
    store.addList(name)
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
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Mis listas</h1>
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor">
            <use href="@/assets/sprite.svg#filter" />
          </svg>
        </button>
      </div>
    </div>

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
      <p class="text-sm">Haz clic en 
        <svg class="inline w-4 h-4 align-text-bottom" fill="none" stroke="currentColor">
          <use href="@/assets/sprite.svg#add-sign" />
        </svg>
        para crear una
      </p>
    </div>

    <!-- Botón flotante abajo a la derecha -->
    <button
      @click="addNewList"
      class="fixed bottom-100 right-40 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-20 h-20 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      <svg class="w-10 h-10 text-gray-800" fill="none" stroke="currentColor">
        <use href="@/assets/sprite.svg#add-sign" />
      </svg>
    </button>
  </div>
</template>
