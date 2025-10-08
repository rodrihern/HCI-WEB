import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id: string
  name: string
  category: string
  pantry?: string
  icon: string
}

export interface ListItem {
  productId: string
  quantity: number
  checked: boolean
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
  id: string
  listName: string
  date: Date
  store: string
}

export const useListsStore = defineStore('lists', () => {
  // Modal state for creating new list
  const isCreatingList = ref(false)
  const newListName = ref('')
  const newListProducts = ref<Array<{ name: string; quantity: number }>>([])

  // Products mock data
  const products = ref<Product[]>([
    { id: '1', name: 'Banana', category: 'Frutas', icon: '🍌' },
    { id: '2', name: 'Leche Proteica', category: 'Lácteos', icon: '🥛' },
    { id: '3', name: 'Papitas', category: 'Snacks', icon: '🥔' },
    { id: '4', name: 'Oreos', category: 'Galletas', icon: '🍪' },
    { id: '5', name: 'Frutilla', category: 'Frutas', icon: '🍓' },
  ])

  // Shopping lists mock data
  const lists = ref<ShoppingList[]>([
    {
      id: '1',
      name: 'Compra Marzo',
      items: [
        { productId: '1', quantity: 6, checked: false },
        { productId: '2', quantity: 2, checked: false },
      ],
      createdAt: new Date('2025-03-15'),
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Verduleria',
      items: [
        { productId: '1', quantity: 3, checked: false },
        { productId: '5', quantity: 2, checked: false },
      ],
      createdAt: new Date('2025-03-18'),
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Carniceria',
      items: [],
      createdAt: new Date('2025-03-20'),
      isFavorite: false,
    },
  ])

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
    { id: '1', listName: 'Compra Marzo', date: new Date('2025-03-01'), store: 'Marzo' },
    { id: '2', listName: 'Verduleria', date: new Date('2025-02-28'), store: 'Febrero' },
    { id: '3', listName: 'Carniceria', date: new Date('2025-02-25'), store: 'Febrero' },
  ])

  // Actions
  const addList = (name: string) => {
    lists.value.push({
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date(),
      isFavorite: false,
    })
  }

  const bulkAddLists = (n: number) => {
    for (let i = 0; i < n; i++) {
      addList(`Demo ${i + 1}`)
    }
  }
  const clearLists = () => {
    lists.value = []
  }

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

  return {
    products,
    lists,
    pantrySections,
    history,
    isCreatingList,
    newListName,
    newListProducts,
    addList,
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
  }
})


