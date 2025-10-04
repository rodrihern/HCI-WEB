<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()

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
</script>

<template>
  <div class="py-6 px-6 relative min-h-full">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Mis listas</h1>
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-3 pb-20">
      <div
        v-for="list in sortedLists"
        :key="list.id"
        class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-white font-semibold text-lg">{{ list.name }}</h3>
            </div>
            <p class="text-white text-sm opacity-90">Creada por Mamá</p>
          </div>
          <button
            @click="store.toggleFavorite(list.id)"
            class="text-2xl"
            :class="list.isFavorite ? 'text-yellow-300' : 'text-white opacity-50'"
          >
            {{ list.isFavorite ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="sortedLists.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes listas todavía</p>
      <p class="text-sm">Haz clic en + para crear una</p>
    </div>

    <!-- Botón flotante abajo a la derecha -->
    <button
      @click="addNewList"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      +
    </button>
  </div>
</template>
