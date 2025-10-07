<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()

const pantryWithProducts = computed(() => {
  return store.pantry
    .map((item) => {
      const product = store.getProductById(item.productId)
      return product ? { ...item, product } : null
    })
    .filter((item) => item !== null)
})

const addToPantry = () => {
  const productName = prompt('Nombre del producto:')
  if (!productName) return

  const product = store.products.find((p) => p.name.toLowerCase() === productName.toLowerCase())
  if (!product) {
    alert('Producto no encontrado')
    return
  }

  const quantity = parseInt(prompt('Cantidad:') || '0')
  if (quantity > 0) {
    store.addToPantry(product.id, quantity)
  }
}

const updateQuantity = (productId: string, change: number) => {
  if (change > 0) {
    store.addToPantry(productId, change)
  } else {
    store.removeFromPantry(productId, Math.abs(change))
  }
}
</script>

<template>
  <div class="py-6 px-6 relative min-h-full">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Despensa</h1>
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor">
            <use href="@/assets/sprite.svg#filter" />
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-3 pb-20">
      <div
        v-for="item in pantryWithProducts"
        :key="item.productId"
        class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ item.product.icon }}</span>
            <span class="text-white font-medium">{{ item.product.name }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="updateQuantity(item.productId, -1)"
              class="bg-white text-[#68AE6F] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold"
            >
              -
            </button>
            <span class="text-white font-semibold text-lg min-w-[2rem] text-center">
              {{ item.quantity }}
            </span>
            <button
              @click="updateQuantity(item.productId, 1)"
              class="bg-white text-[#68AE6F] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pantryWithProducts.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">Tu despensa está vacía</p>
      <p class="text-sm">Haz clic en 
        <svg class="inline w-4 h-4 align-text-bottom" fill="none" stroke="currentColor">
          <use href="@/assets/sprite.svg#add-sign" />
        </svg>
        para agregar productos
      </p>
    </div>

    <!-- Botón flotante abajo a la derecha -->
    <button
      @click="addToPantry"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor">
        <use href="@/assets/sprite.svg#add-sign" />
      </svg>
    </button>
  </div>
</template>
