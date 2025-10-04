<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()

const productsByCategory = computed(() => {
  const grouped: Record<string, typeof store.products> = {}
  store.products.forEach((product) => {
    if (!grouped[product.category]) {
      grouped[product.category] = []
    }
    grouped[product.category].push(product)
  })
  return grouped
})

const addNewProduct = () => {
  const name = prompt('Nombre del producto:')
  if (!name) return

  const category = prompt('Categoría:')
  if (!category) return

  const icon = prompt('Emoji del producto:')
  if (!icon) return

  store.addProduct({ name, category, icon })
}

const deleteProduct = (id: string) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    store.deleteProduct(id)
  }
}
</script>

<template>
  <div class="py-6 px-6 relative min-h-full">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Productos</h1>
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

    <div class="space-y-6 pb-20">
      <div v-for="(products, category) in productsByCategory" :key="category">
        <h2 class="text-base font-medium text-gray-600 mb-3">{{ category }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="product in products"
            :key="product.id"
            class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ product.icon }}</span>
              <span class="text-white font-medium">{{ product.name }}</span>
            </div>
            <button class="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.products.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes productos todavía</p>
      <p class="text-sm">Haz clic en + para crear uno</p>
    </div>

    <!-- Botón flotante abajo a la derecha -->
    <button
      @click="addNewProduct"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      +
    </button>
  </div>
</template>
