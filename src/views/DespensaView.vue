<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import PageHeader from '@/components/PageHeader.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import ProductCard from '@/components/ProductCard.vue'
import ListItem from '@/components/ListItem.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu.vue'

const store = useListsStore()

const sectionsWithProducts = computed(() => {
  return store.pantrySections.map((section) => {
    const items = section.items
      .map((item) => {
        const product = store.getProductById(item.productId)
        return product ? { ...item, product } : null
      })
      .filter((item) => item !== null)
    return { ...section, items }
  })
})

// Contextual menu state
const openMenuKey = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const itemToDelete = ref<{ sectionId: string; productId: string } | null>(null)

const toggleMenu = (e: Event, key: string) => {
  e.stopPropagation()
  openMenuKey.value = openMenuKey.value === key ? null : key
}

const closeMenu = () => (openMenuKey.value = null)
const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
onMounted(() => { window.addEventListener('click', closeMenu); window.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => { window.removeEventListener('click', closeMenu); window.removeEventListener('keydown', onKeydown) })

const addToPantry = (sectionId?: string) => {
  const productName = prompt('Nombre del producto:')
  if (!productName) return

  const product = store.products.find((p) => p.name.toLowerCase() === productName.toLowerCase())
  if (!product) {
    alert('Producto no encontrado')
    return
  }

  const quantity = parseInt(prompt('Cantidad:') || '0')
  if (quantity > 0) {
    if (sectionId) {
      store.addToPantryInSection(sectionId, product.id, quantity)
    } else {
      store.addToPantry(product.id, quantity)
    }
  }
}

const updateQuantity = (sectionId: string, productId: string, change: number) => {
  if (change > 0) store.addToPantryInSection(sectionId, productId, change)
  else store.removeFromPantryInSection(sectionId, productId, Math.abs(change))
}

const modifyItem = (sectionId: string, productId: string, currentQty: number) => {
  const value = prompt('Nueva cantidad:', String(currentQty))
  if (value === null) return
  const qty = parseInt(value)
  if (isNaN(qty)) return
  store.setPantryQuantityInSection(sectionId, productId, qty)
  closeMenu()
}

const confirmDeleteItem = (sectionId: string, productId: string) => {
  itemToDelete.value = { sectionId, productId }
  showDeleteConfirm.value = true
  closeMenu()
}

const deleteItem = () => {
  if (itemToDelete.value) {
    store.removeItemFromPantryInSection(itemToDelete.value.sectionId, itemToDelete.value.productId)
  }
  showDeleteConfirm.value = false
  itemToDelete.value = null
}
</script>

<template>
  <div class="py-6 px-6 relative min-h-full">
    <PageHeader 
      title="Despensa" 
      :onAddClick="() => addToPantry()"
      :showFilter="true"
    />

    <div class="space-y-8 pb-20">
      <CollapsibleSection
        v-for="section in sectionsWithProducts" 
        :key="section.id"
        :title="section.name"
        :showAddButton="true"
        addButtonText="Agregar"
        :onAddClick="() => addToPantry(section.id)"
      >
        <div class="space-y-3">
          <ListItem
            v-for="item in section.items"
            :key="section.id + '-' + item.productId"
            :title="item.product.name"
            :icon="item.product.icon"
            :show-quantity-controls="true"
            :quantity="item.quantity"
            @quantity-change="(change) => updateQuantity(section.id, item.productId, change)"
          >
            <template #actions>
              <button
                class="text-white hover:text-gray-200 transition-colors p-2"
                @click="toggleMenu($event, section.id + '-' + item.productId)"
                aria-haspopup="menu"
                :aria-expanded="openMenuKey === section.id + '-' + item.productId"
              >
                <svg class="w-5 h-5" fill="currentColor">
                  <use href="@/assets/sprite.svg#three-dots" />
                </svg>
              </button>

              <!-- Menú contextual -->
              <ContextMenu
                :show="openMenuKey === section.id + '-' + item.productId"
                :items="[
                  {
                    label: 'Modificar',
                    onClick: () => modifyItem(section.id, item.productId, item.quantity)
                  },
                  {
                    label: 'Eliminar',
                    onClick: () => confirmDeleteItem(section.id, item.productId),
                    variant: 'danger'
                  }
                ]"
              />
            </template>
          </ListItem>
        </div>
      </CollapsibleSection>
    </div>

    <div v-if="sectionsWithProducts.every(s => s.items.length === 0)" class="text-center text-gray-500 mt-12">
      <p class="text-lg">Tu despensa está vacía</p>
      <p class="text-sm">Haz clic en el botón + para agregar productos</p>
    </div>

    <ConfirmationModal
      :show="showDeleteConfirm"
      title="Eliminar producto"
      message="¿Estás seguro de que quieres eliminar este producto de la despensa?"
      variant="danger"
      @confirm="deleteItem"
      @cancel="showDeleteConfirm = false"
    >
      <template #details>
        <p class="text-sm text-gray-600 mt-2">
          Esta acción no se puede deshacer.
        </p>
      </template>
    </ConfirmationModal>
  </div>
</template>
