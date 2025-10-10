<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import PageHeader from '@/components/PageHeader.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import ProductCard from '@/components/ProductCard.vue'
import CreateProductModal from '@/components/CreateProductModal.vue'

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

// Distribuir productos en dos columnas
const distributeInColumns = (products: typeof store.products) => {
  const column1: typeof store.products = []
  const column2: typeof store.products = []
  
  products.forEach((product, index) => {
    if (index % 2 === 0) {
      column1.push(product)
    } else {
      column2.push(product)
    }
  })
  
  return { column1, column2 }
}

// Modal state
const showModal = ref(false)

const openAddProductModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <div class="py-6 px-6 relative min-h-full">
    <PageHeader 
      title="Productos" 
      :onAddClick="openAddProductModal"
      :showFilter="true"
    />

    <div class="space-y-6 pb-20">
      <CollapsibleSection
        v-for="(products, category) in productsByCategory" 
        :key="category"
        :title="category"
      >
        <!-- Dos columnas independientes -->
        <div class="flex flex-col md:flex-row gap-3">
          <!-- Columna 1 -->
          <div class="flex-1 space-y-3">
            <ProductCard
              v-for="product in distributeInColumns(products).column1"
              :key="product.id"
              :icon="product.icon"
              :name="product.name"
              :category="product.category"
              :description="product.description"
              :image="product.image"
              :onActionClick="() => {}"
            />
          </div>
          
          <!-- Columna 2 -->
          <div class="flex-1 space-y-3">
            <ProductCard
              v-for="product in distributeInColumns(products).column2"
              :key="product.id"
              :icon="product.icon"
              :name="product.name"
              :category="product.category"
              :description="product.description"
              :image="product.image"
              :onActionClick="() => {}"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div v-if="store.products.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes productos todavía</p>
      <p class="text-sm">Haz clic en el botón + para crear uno</p>
    </div>

    <!-- Modal Add Product -->
    <CreateProductModal :show="showModal" @close="closeModal" />
  </div>
</template>
