import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useListsStore = defineStore('lists', () => {
  // Modal state for previewing list
  const isPreviewingList = ref(false)
  const previewingListId = ref<string | null>(null)

  // Modal state for previewing historial
  const isPreviewingHistorial = ref(false)
  const previewingHistorialId = ref<number | null>(null)

  // Preview modal functions
  const openPreviewListModal = (listId: string) => {
    previewingListId.value = listId
    isPreviewingList.value = true
  }

  const closePreviewListModal = () => {
    isPreviewingList.value = false
    previewingListId.value = null
  }

  // Preview historial modal functions
  const openPreviewHistorialModal = (historialId: number) => {
    previewingHistorialId.value = historialId
    isPreviewingHistorial.value = true
  }

  const closePreviewHistorialModal = () => {
    isPreviewingHistorial.value = false
    previewingHistorialId.value = null
  }

  return {
    isPreviewingList,
    previewingListId,
    isPreviewingHistorial,
    previewingHistorialId,
    openPreviewListModal,
    closePreviewListModal,
    openPreviewHistorialModal,
    closePreviewHistorialModal,
  }
})


