<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useListsStore } from '../stores/lists'

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
const toggleMenu = (key: string) => {
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

const shareItem = (sectionName: string, productName: string, quantity: number) => {
  const text = `En ${sectionName}: ${productName} x${quantity}`
  if (navigator.share) {
    navigator.share({ title: 'Compartir producto', text }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text)
    alert('Información copiada al portapapeles')
  }
  closeMenu()
}

const modifyItem = (sectionId: string, productId: string, currentQty: number) => {
  const value = prompt('Nueva cantidad:', String(currentQty))
  if (value === null) return
  const qty = parseInt(value)
  if (isNaN(qty)) return
  store.setPantryQuantityInSection(sectionId, productId, qty)
  closeMenu()
}

const deleteItem = (sectionId: string, productId: string) => {
  if (confirm('¿Eliminar producto de la despensa?')) {
    store.removeItemFromPantryInSection(sectionId, productId)
  }
  closeMenu()
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

    <div class="space-y-8 pb-20">
      <div v-for="section in sectionsWithProducts" :key="section.id">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-medium text-gray-700">{{ section.name }}</h2>
          <button
            class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50"
            @click="addToPantry(section.id)"
          >
            Agregar
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in section.items"
            :key="section.id + '-' + item.productId"
            class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ item.product.icon }}</span>
                <span class="text-white font-medium">{{ item.product.name }}</span>
              </div>
              <div class="flex items-center gap-3" @click.stop>
                <button
                  @click="updateQuantity(section.id, item.productId, -1)"
                  class="bg-white text-[#68AE6F] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold"
                >
                  -
                </button>
                <span class="text-white font-semibold text-lg min-w-[2rem] text-center">
                  {{ item.quantity }}
                </span>
                <button
                  @click="updateQuantity(section.id, item.productId, 1)"
                  class="bg-white text-[#68AE6F] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors font-semibold"
                >
                  +
                </button>
                <button
                  class="text-white hover:text-gray-200 transition-colors p-2"
                  @click.stop="toggleMenu(section.id + '-' + item.productId)"
                  aria-haspopup="menu"
                  :aria-expanded="openMenuKey === section.id + '-' + item.productId"
                >
                  <svg class="w-5 h-5" fill="currentColor">
                    <use href="@/assets/sprite.svg#three-dots" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              v-if="openMenuKey === section.id + '-' + item.productId"
              class="absolute right-2 top-12 z-20 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200"
              role="menu"
              @click.stop
            >
              <button class="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-xl" role="menuitem" @click="shareItem(section.name, item.product.name, item.quantity)">Compartir</button>
              <button class="w-full text-left px-4 py-2 hover:bg-gray-50" role="menuitem" @click="modifyItem(section.id, item.productId, item.quantity)">Modificar</button>
              <button class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-xl" role="menuitem" @click="deleteItem(section.id, item.productId)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sectionsWithProducts.every(s => s.items.length === 0)" class="text-center text-gray-500 mt-12">
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
      @click="addToPantry()"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor">
        <use href="@/assets/sprite.svg#add-sign" />
      </svg>
    </button>
  </div>
</template>
