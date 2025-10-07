<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()

const productsByCategory = computed(() => {
  const grouped: Record<string, typeof store.products> = {}
  store.products.forEach((product) => {
    const categoryGroup = grouped[product.category] || []
    categoryGroup.push(product)
    grouped[product.category] = categoryGroup
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
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor">
            <use href="@/assets/sprite.svg#filter" />
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
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#add-sign" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.products.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes productos todavía</p>
      <p class="text-sm">Haz clic en 
        <svg class="inline w-4 h-4 align-text-bottom" fill="none" stroke="currentColor">
          <use href="@/assets/sprite.svg#add-sign" />
        </svg>
        para crear uno
      </p>
    </div>

    <!-- Botón flotante abajo a la derecha -->
    <button
      @click="addNewProduct"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor">
        <use href="@/assets/sprite.svg#add-sign" />
      </svg>
    </button>
  </div>
</template>
