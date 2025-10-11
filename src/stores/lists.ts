import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id: string
  name: string
  category: string
  pantry?: string
  icon: string
  description?: string
  image?: string
}

export interface ListItem {
  productId: string
  quantity: number
  unit: string
  checked: boolean
  metadata: Record<string, any>
}

export interface ShoppingList {
  id: string
  name: string
  items: ListItem[]
  createdAt: Date
  isFavorite: boolean
}

export interface PantryItem {
  productId: string
  quantity: number
}

export interface PantrySection {
  id: string
  name: string
  items: PantryItem[]
}

export interface HistoryItem {
  id: number
  metadata: Record<string, any>
  owner: {
    id: number
    name: string
    surname: string
    email: string
    metadata: Record<string, any>
    createdAt: string
    updatedAt: string
  }
  list: {
    id: number
    name: string
    description: string
    recurring: boolean
    metadata: Record<string, any>
    owner: {
      id: number
      name: string
      surname: string
      email: string
      metadata: Record<string, any>
      createdAt: string
      updatedAt: string
    }
    sharedWith: any[]
    lastPurchasedAt: string
    createdAt: string
    updatedAt: string
  }
  listItemArray: Array<{
    id: number
    quantity: number
    unit: string
    metadata: Record<string, any>
    purchased: boolean
    lastPurchasedAt: string | null
    createdAt: string
    updatedAt: string
    product: {
      id: number
      name: string
      metadata: Record<string, any>
      createdAt: string
      updatedAt: string
      category: {
        id: number
        name: string
        metadata: Record<string, any>
        createdAt: string
        updatedAt: string
      }
      pantry: any
    }
  }>
}

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

  // Products - now managed by API
  const products = ref<Product[]>([])

  // Shopping lists - now managed by API
  const lists = ref<ShoppingList[]>([])

  // Pantry mock data (now grouped into sections)
  const pantrySections = ref<PantrySection[]>([
    {
      id: 'dry',
      name: 'Despensa Seca',
      items: [
        { productId: '1', quantity: 4 },
        { productId: '3', quantity: 2 },
        { productId: '4', quantity: 3 },
      ],
    },
    {
      id: 'wet',
      name: 'Despensa Húmeda',
      items: [
        { productId: '2', quantity: 1 },
      ],
    },
  ])

  // History mock data
  const history = ref<HistoryItem[]>([
    {
      id: 1,
      metadata: {},
      owner: {
        id: 2,
        name: "Juan",
        surname: "Doe",
        email: "juan@example.com",
        metadata: {},
        createdAt: "2023-10-09 08:30:00",
        updatedAt: "2023-10-10 14:00:00"
      },
      list: {
        id: 1,
        name: "Supermarket",
        description: "Monthly groceries",
        recurring: true,
        metadata: {},
        owner: {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "johndoe@email.com",
          metadata: {},
          createdAt: "2025-10-09 09:15:00",
          updatedAt: "2025-10-10 15:30:00"
        },
        sharedWith: [],
        lastPurchasedAt: "2025-09-05 18:00:00",
        createdAt: "2025-09-01 10:30:00",
        updatedAt: "2025-09-05 14:45:00"
      },
      listItemArray: [
        {
          id: 2,
          quantity: 4,
          unit: "l",
          metadata: {},
          purchased: false,
          lastPurchasedAt: null,
          createdAt: "2025-09-16 11:00:00",
          updatedAt: "2025-09-16 11:00:00",
          product: {
            id: 2,
            name: "Milk",
            metadata: {
              barcode: "2222222222"
            },
            createdAt: "2025-09-11 10:30:00",
            updatedAt: "2025-09-11 10:30:00",
            category: {
              id: 2,
              name: "Bakery",
              metadata: {},
              createdAt: "2025-09-08 09:00:00",
              updatedAt: "2025-09-08 09:00:00"
            },
            pantry: null
          }
        }
      ]
    },
    {
      id: 2,
      metadata: {},
      owner: {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "johndoe@email.com",
        metadata: {},
        createdAt: "2023-10-09 08:30:00",
        updatedAt: "2023-10-10 14:00:00"
      },
      list: {
        id: 2,
        name: "Verduleria",
        description: "Fresh vegetables and fruits",
        recurring: false,
        metadata: {},
        owner: {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "johndoe@email.com",
          metadata: {},
          createdAt: "2025-10-09 09:15:00",
          updatedAt: "2025-10-10 15:30:00"
        },
        sharedWith: [],
        lastPurchasedAt: "2025-02-28 16:30:00",
        createdAt: "2025-02-25 10:00:00",
        updatedAt: "2025-02-28 16:30:00"
      },
      listItemArray: [
        {
          id: 3,
          quantity: 2,
          unit: "kg",
          metadata: {},
          purchased: true,
          lastPurchasedAt: "2025-02-28 16:30:00",
          createdAt: "2025-02-25 11:00:00",
          updatedAt: "2025-02-28 16:30:00",
          product: {
            id: 1,
            name: "Banana",
            metadata: {},
            createdAt: "2025-02-20 10:30:00",
            updatedAt: "2025-02-20 10:30:00",
            category: {
              id: 1,
              name: "Frutas",
              metadata: {},
              createdAt: "2025-02-15 09:00:00",
              updatedAt: "2025-02-15 09:00:00"
            },
            pantry: null
          }
        }
      ]
    }
  ])

  // Actions
  // Note: List CRUD operations now handled by API via useShoppingList composable
  // Mock lists array maintained for backward compatibility with other features

  const deleteList = (id: string) => {
    lists.value = lists.value.filter((list) => list.id !== id)
  }

  const toggleFavorite = (id: string) => {
    const list = lists.value.find((l) => l.id === id)
    if (list) {
      list.isFavorite = !list.isFavorite
    }
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    products.value.push({
      id: Date.now().toString(),
      ...product,
    })
  }

  const deleteProduct = (id: string) => {
    products.value = products.value.filter((p) => p.id !== id)
  }

  const addToPantryInSection = (sectionId: string, productId: string, quantity: number) => {
    const section = pantrySections.value.find((s) => s.id === sectionId)
    if (!section) return
    const item = section.items.find((p) => p.productId === productId)
    if (item) {
      item.quantity += quantity
    } else {
      section.items.push({ productId, quantity })
    }
  }

  // Back-compat helper: add to default section
  const addToPantry = (productId: string, quantity: number) => {
    addToPantryInSection('dry', productId, quantity)
  }

  const removeFromPantryInSection = (sectionId: string, productId: string, quantity: number) => {
    const section = pantrySections.value.find((s) => s.id === sectionId)
    if (!section) return
    const item = section.items.find((p) => p.productId === productId)
    if (!item) return
    item.quantity -= quantity
    if (item.quantity <= 0) {
      section.items = section.items.filter((p) => p.productId !== productId)
    }
  }

  const setPantryQuantityInSection = (sectionId: string, productId: string, quantity: number) => {
    const section = pantrySections.value.find((s) => s.id === sectionId)
    if (!section) return
    if (quantity <= 0) {
      section.items = section.items.filter((p) => p.productId !== productId)
      return
    }
    const item = section.items.find((p) => p.productId === productId)
    if (item) item.quantity = quantity
    else section.items.push({ productId, quantity })
  }

  const removeItemFromPantryInSection = (sectionId: string, productId: string) => {
    const section = pantrySections.value.find((s) => s.id === sectionId)
    if (!section) return
    section.items = section.items.filter((p) => p.productId !== productId)
  }

  // Back-compat helper: remove from default section
  const removeFromPantry = (productId: string, quantity: number) => {
    removeFromPantryInSection('dry', productId, quantity)
  }

  const getProductById = (id: string) => {
    return products.value.find((p) => p.id === id)
  }

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

  const updateListItemQuantity = (listId: string, productId: string, quantity: number) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return
    
    const item = list.items.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        list.items = list.items.filter(i => i.productId !== productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const toggleListItemChecked = (listId: string, productId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return
    
    const item = list.items.find(i => i.productId === productId)
    if (item) {
      item.checked = !item.checked
    }
  }

  const addItemToList = (listId: string, productId: string, quantity: number = 1, unit: string = 'unidad') => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return
    
    const existingItem = list.items.find(i => i.productId === productId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      list.items.push({ productId, quantity, unit, checked: false, metadata: {} })
    }
  }

  const removeItemFromList = (listId: string, productId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return
    
    list.items = list.items.filter(i => i.productId !== productId)
  }

  const getPreviewingList = () => {
    if (!previewingListId.value) return null
    return lists.value.find(l => l.id === previewingListId.value)
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

  const getPreviewingHistorial = () => {
    if (!previewingHistorialId.value) return null
    return history.value.find(h => h.id === previewingHistorialId.value)
  }

  return {
    products,
    lists,
    pantrySections,
    history,
    isCreatingList,
    newListName,
    newListProducts,
    isPreviewingList,
    previewingListId,
    isPreviewingHistorial,
    previewingHistorialId,
    deleteList,
    toggleFavorite,
    addProduct,
    deleteProduct,
    addToPantry,
    removeFromPantry,
    addToPantryInSection,
    removeFromPantryInSection,
    setPantryQuantityInSection,
    removeItemFromPantryInSection,
    getProductById,
    openCreateListModal,
    closeCreateListModal,
    setNewListName,
    addProductToNewList,
    removeProductFromNewList,
    updateNewListProductQuantity,
    openPreviewListModal,
    closePreviewListModal,
    updateListItemQuantity,
    toggleListItemChecked,
    addItemToList,
    removeItemFromList,
    getPreviewingList,
    openPreviewHistorialModal,
    closePreviewHistorialModal,
    getPreviewingHistorial,
  }
})


