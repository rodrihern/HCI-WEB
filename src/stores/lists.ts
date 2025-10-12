import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useListsStore = defineStore('lists', () => {
  // Modal state for creating new list
  const isCreatingList = ref(false)
  const newListName = ref('')
  const newListProducts = ref<Array<{ name: string; quantity: number }>>([])

  // Modal state for previewing list
  const isPreviewingList = ref(false)
  const previewingListId = ref<string | null>(null)

  // Modal state for previewing historial
  const isPreviewingHistorial = ref(false)
  const previewingHistorialId = ref<number | null>(null)

  // Modal management functions
  const openCreateListModal = () => {
    isCreatingList.value = true
  }

  const closeCreateListModal = () => {
    isCreatingList.value = false
    newListName.value = ''
    newListProducts.value = []
  }

  const setNewListName = (name: string) => {
    newListName.value = name
  }

  const addProductToNewList = (name: string) => {
    if (name.trim()) {
      newListProducts.value.push({ name: name.trim(), quantity: 1 })
    }
  }

  const removeProductFromNewList = (index: number) => {
    newListProducts.value.splice(index, 1)
  }

  const updateNewListProductQuantity = (index: number, quantity: number) => {
    const product = newListProducts.value[index]
    if (product && quantity > 0) {
      product.quantity = quantity
    }
  }

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
    isCreatingList,
    newListName,
    newListProducts,
    isPreviewingList,
    previewingListId,
    isPreviewingHistorial,
    previewingHistorialId,
    openCreateListModal,
    closeCreateListModal,
    setNewListName,
    addProductToNewList,
    removeProductFromNewList,
    updateNewListProductQuantity,
    openPreviewListModal,
    closePreviewListModal,
    openPreviewHistorialModal,
    closePreviewHistorialModal,
  }
})


