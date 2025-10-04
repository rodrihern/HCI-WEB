import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id: string
  name: string
  category: string
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

export interface HistoryItem {
  id: string
  listName: string
  date: Date
  store: string
}

export const useListsStore = defineStore('lists', () => {
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

  // Pantry mock data
  const pantry = ref<PantryItem[]>([
    { productId: '1', quantity: 4 },
    { productId: '2', quantity: 1 },
    { productId: '3', quantity: 2 },
    { productId: '4', quantity: 3 },
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

  const addToPantry = (productId: string, quantity: number) => {
    const item = pantry.value.find((p) => p.productId === productId)
    if (item) {
      item.quantity += quantity
    } else {
      pantry.value.push({ productId, quantity })
    }
  }

  const removeFromPantry = (productId: string, quantity: number) => {
    const item = pantry.value.find((p) => p.productId === productId)
    if (item) {
      item.quantity -= quantity
      if (item.quantity <= 0) {
        pantry.value = pantry.value.filter((p) => p.productId !== productId)
      }
    }
  }

  const getProductById = (id: string) => {
    return products.value.find((p) => p.id === id)
  }

  return {
    products,
    lists,
    pantry,
    history,
    addList,
    deleteList,
    toggleFavorite,
    addProduct,
    deleteProduct,
    addToPantry,
    removeFromPantry,
    getProductById,
  }
})
