<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import ContextMenu, { type ContextMenuItem } from '../components/ContextMenu.vue'

const store = useListsStore()

const openMenuForItemId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const itemToDelete = ref<string | null>(null)

const toggleMenu = (e: Event, id: string) => {
  e.stopPropagation()
  openMenuForItemId.value = openMenuForItemId.value === id ? null : id
}

const closeMenu = () => {
  openMenuForItemId.value = null
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => {
  window.addEventListener('click', closeMenu)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu)
  window.removeEventListener('keydown', onKeydown)
})

const onEdit = (id: string) => {
  // Replace with real edit logic
  alert('Modificar ' + id)
  closeMenu()
}

const confirmDelete = (id: string) => {
  itemToDelete.value = id
  showDeleteConfirm.value = true
  closeMenu()
}

const onDelete = () => {
  if (itemToDelete.value) {
    // Implement deletion in store if applicable
    alert('Eliminar ' + itemToDelete.value)
  }
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

const historyByStore = computed(() => {
  const grouped: Record<string, typeof store.history> = {}
  store.history.forEach((item) => {
    const storeGroup = grouped[item.store] || []
    storeGroup.push(item)
    grouped[item.store] = storeGroup
  })
  return grouped
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="py-6 px-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Mis compras</h1>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="(items, storeName) in historyByStore" :key="storeName">
        <h3 class="text-base font-medium text-gray-600 mb-3">{{ storeName }}</h3>
        <div class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="bg-verde-claro rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div class="flex items-center justify-between" @click.stop>
              <div>
                <h3 class="text-white font-semibold">{{ item.listName }}</h3>
                <p class="text-white text-sm opacity-90">{{ formatDate(item.date) }}</p>
              </div>
              <button
                class="text-white hover:text-gray-200 transition-colors p-2"
                @click="toggleMenu($event, item.id)"
                aria-haspopup="menu"
                :aria-expanded="openMenuForItemId === item.id"
              >
                <svg class="w-5 h-5" fill="currentColor">
                  <use href="@/assets/sprite.svg#three-dots" />
                </svg>
              </button>
            </div>

            <ContextMenu
              :show="openMenuForItemId === item.id"
              :items="[
                {
                  label: 'Modificar',
                  onClick: () => onEdit(item.id)
                },
                {
                  label: 'Eliminar',
                  onClick: () => confirmDelete(item.id),
                  variant: 'danger'
                }
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.history.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes historial todavía</p>
      <p class="text-sm">Tus compras aparecerán aquí</p>
    </div>

    <ConfirmationModal
      :show="showDeleteConfirm"
      title="Eliminar compra del historial"
      message="¿Estás seguro de que quieres eliminar esta compra del historial?"
      variant="danger"
      @confirm="onDelete"
      @cancel="showDeleteConfirm = false"
    >
      <template #details>
        <p class="text-sm text-gray-600 mt-2">
          Esta acción no se puede deshacer.
        </p>
      </template>
    </ConfirmationModal>
  </div>
</template>
