<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import PageHeader from '@/components/PageHeader.vue'
import CreateListModal from '@/components/CreateListModal.vue'
import PreviewListModal from '@/components/PreviewListModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ListItem from '@/components/ListItem.vue'

const store = useListsStore()
const animatingFavorites = ref<Set<string>>(new Set())

// Estado del modal de confirmación
const showDeleteConfirm = ref(false)
const listToDelete = ref<string | null>(null)

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

const openPreviewList = (listId: string) => {
  store.openPreviewListModal(listId)
}

const confirmDelete = (id: string) => {
  listToDelete.value = id
  showDeleteConfirm.value = true
}

const deleteList = () => {
  if (listToDelete.value) {
    store.deleteList(listToDelete.value)
    listToDelete.value = null
  }
  showDeleteConfirm.value = false
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
  <div class="py-6 px-6 relative min-h-full">
    <PageHeader 
      title="Mis listas" 
      :onAddClick="addNewList"
      :showFilter="true"
    />

    <div class="space-y-3 pb-20">
      <transition-group name="list-move">
        <ListItem
          v-for="list in sortedLists"
          :key="list.id"
          :title="list.name"
          subtitle="Creada por Mamá"
          :is-animating="animatingFavorites.has(list.id)"
          @click="openPreviewList(list.id)"
          class="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <template #actions>
            <button
              @click.stop="toggleFavoriteWithAnimation(list.id)"
              class="p-2 hover:scale-110 transition-transform duration-200"
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
          </template>
        </ListItem>
      </transition-group>
    </div>

    <div v-if="sortedLists.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes listas todavía</p>
      <p class="text-sm">Haz clic en el botón + para crear una</p>
    </div>
  </div>

  <!-- Modal para crear nueva lista -->
  <CreateListModal @close="store.closeCreateListModal" />

  <!-- Modal para vista previa de lista -->
  <PreviewListModal @close="store.closePreviewListModal" />

  <!-- Modal de confirmación para eliminar -->
  <ConfirmationModal
    :show="showDeleteConfirm"
    title="Eliminar lista"
    message="¿Estás seguro de que quieres eliminar esta lista?"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="deleteList"
    @cancel="showDeleteConfirm = false"
  >
    <template #details>
      <p class="text-sm text-gray-600 mt-2">
        Esta acción no se puede deshacer.
      </p>
    </template>
  </ConfirmationModal>
</template>
