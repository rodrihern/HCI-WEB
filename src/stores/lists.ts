import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useListsStore = defineStore('lists', () => {
  const isPreviewingList = ref(false)
  const previewingListId = ref<string | null>(null)

  const isPreviewingHistorial = ref(false)
  const previewingHistorialId = ref<number | null>(null)

  const openPreviewListModal = (listId: string) => {
    previewingListId.value = listId
    isPreviewingList.value = true
  }

  const closePreviewListModal = () => {
    isPreviewingList.value = false
    previewingListId.value = null
  }

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


