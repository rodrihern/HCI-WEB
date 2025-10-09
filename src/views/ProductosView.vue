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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :icon="product.icon"
            :name="product.name"
            :onActionClick="() => {}"
          />
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
