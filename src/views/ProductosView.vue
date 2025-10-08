<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

// Modal state
const showModal = ref(false)
const productName = ref('')
const selectedCategory = ref('')
const categorySearch = ref('')
const isCategoryOpen = ref(false)
const newCategoryName = ref('')
const selectedPantry = ref('')
const pantrySearch = ref('')
const isPantryOpen = ref(false)
const newPantryName = ref('')
const selectedFile = ref<File | null>(null)

// Derive unique categories from existing products
const categories = computed(() => {
  const set = new Set<string>()
  store.products.forEach((p) => set.add(p.category))
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredCategories = computed(() => {
  const term = categorySearch.value.trim().toLowerCase()
  if (!term) return categories.value
  return categories.value.filter((c) => c.toLowerCase().includes(term))
})

// Derive unique pantries from existing pantry sections
const pantries = computed(() => {
  return store.pantrySections.map((section) => section.name).sort((a, b) => a.localeCompare(b))
})

const filteredPantries = computed(() => {
  const term = pantrySearch.value.trim().toLowerCase()
  if (!term) return pantries.value
  return pantries.value.filter((p) => p.toLowerCase().includes(term))
})

const openAddProductModal = () => {
  showModal.value = true
  productName.value = ''
  selectedCategory.value = ''
  categorySearch.value = ''
  newCategoryName.value = ''
  selectedPantry.value = ''
  pantrySearch.value = ''
  newPantryName.value = ''
  selectedFile.value = null
  isCategoryOpen.value = false
  isPantryOpen.value = false
}

const closeModal = () => {
  showModal.value = false
}

const onOverlayClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target && target.dataset.overlay === 'true') closeModal()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  selectedFile.value = files && files[0] ? files[0] : null
}

const chooseCategory = (c: string) => {
  selectedCategory.value = c
  isCategoryOpen.value = false
}

const addNewCategory = () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  selectedCategory.value = name
  newCategoryName.value = ''
  isCategoryOpen.value = false
}

const choosePantry = (p: string) => {
  selectedPantry.value = p
  isPantryOpen.value = false
}

const addNewPantry = () => {
  const name = newPantryName.value.trim()
  if (!name) return
  selectedPantry.value = name
  newPantryName.value = ''
  isPantryOpen.value = false
}

const submitProduct = () => {
  const name = productName.value.trim()
  const category = selectedCategory.value.trim()
  const pantry = selectedPantry.value.trim()
  if (!name || !category) return
  // For now we ignore the uploaded file in the data model and use a generic icon
  store.addProduct({ name, category, pantry: pantry || undefined, icon: '🛒' })
  closeModal()
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
            <button class="p-2 hover:bg-[#5C805E]/60 rounded-lg transition-colors">
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
      @click="openAddProductModal"
      class="fixed bottom-8 right-8 bg-white border-2 border-gray-800 hover:bg-gray-50 text-gray-800 rounded-full w-14 h-14 flex items-center justify-center text-3xl transition-colors shadow-lg font-light"
    >
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor">
        <use href="@/assets/sprite.svg#add-sign" />
      </svg>
    </button>

    <!-- Modal Add Product -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      data-overlay="true"
      @click="onOverlayClick"
    >
      <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]" data-overlay="true"></div>
      <div class="relative w-[360px] bg-[#8BBE7F] rounded-3xl shadow-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white text-lg font-semibold">Nuevo producto</h3>
          <button class="text-white/90 hover:text-white" @click="closeModal">✕</button>
        </div>

        <!-- Name input -->
        <div class="mb-4">
          <input
            v-model="productName"
            type="text"
            placeholder="Nombre"
            class="w-full px-4 py-3 rounded-full bg-white/20 placeholder-white/90 text-white outline-none border border-white/60"
          />
        </div>

        <!-- Media drop area -->
        <label class="block mb-4">
          <div class="w-full h-40 rounded-2xl border-2 border-dashed border-white/80 flex flex-col items-center justify-center text-white cursor-pointer">
            <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#image" />
            </svg>
            <span class="text-sm">Añadir Multimedia</span>
          </div>
          <input type="file" class="hidden" @change="onFileChange" />
        </label>

        <!-- Category selector -->
        <div class="relative">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 text-gray-800"
            @click="isCategoryOpen = !isCategoryOpen"
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#search" />
            </svg>
            <span class="flex-1 text-left">{{ selectedCategory || 'Categoría' }}</span>
            <button class="p-1 -mr-1" @click.stop="selectedCategory = ''" aria-label="clear">
              <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#close" />
              </svg>
            </button>
          </button>

          <div
            v-if="isCategoryOpen"
            class="absolute left-0 right-0 mt-1 bg-[#5F9A6C] text-white rounded-xl shadow-xl overflow-hidden z-10"
            @click.stop
          >
            <div class="px-3 py-2 bg-white/10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#search" />
              </svg>
              <input
                v-model="categorySearch"
                type="text"
                placeholder="Categoría"
                class="flex-1 bg-transparent placeholder-white/90 text-white outline-none"
              />
              <button class="p-1" @click="categorySearch = ''">
                <svg class="w-4 h-4" fill="none" stroke="currentColor">
                  <use href="@/assets/sprite.svg#close" />
                </svg>
              </button>
            </div>

            <div class="max-h-48 overflow-auto">
              <button
                v-for="c in filteredCategories"
                :key="c"
                class="w-full text-left px-5 py-2 hover:bg-white/10 border-t border-white/20 first:border-t-0"
                @click="chooseCategory(c)"
              >
                {{ c }}
              </button>
            </div>

            <div class="border-t border-white/20 px-4 py-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#add-sign" />
              </svg>
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="Nueva Categoría"
                class="flex-1 bg-transparent placeholder-white/90 text-white outline-none"
              />
              <button class="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30" @click="addNewCategory">Agregar</button>
            </div>
          </div>
        </div>

        <!-- Pantry selector -->
        <div class="relative mt-4">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 text-gray-800"
            @click="isPantryOpen = !isPantryOpen"
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#search" />
            </svg>
            <span class="flex-1 text-left">{{ selectedPantry || 'Despensa (opcional)' }}</span>
            <button class="p-1 -mr-1" @click.stop="selectedPantry = ''" aria-label="clear">
              <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#close" />
              </svg>
            </button>
          </button>

          <div
            v-if="isPantryOpen"
            class="absolute left-0 right-0 mt-1 bg-[#5F9A6C] text-white rounded-xl shadow-xl overflow-hidden z-10"
            @click.stop
          >
            <div class="px-3 py-2 bg-white/10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#search" />
              </svg>
              <input
                v-model="pantrySearch"
                type="text"
                placeholder="Despensa"
                class="flex-1 bg-transparent placeholder-white/90 text-white outline-none"
              />
              <button class="p-1" @click="pantrySearch = ''">
                <svg class="w-4 h-4" fill="none" stroke="currentColor">
                  <use href="@/assets/sprite.svg#close" />
                </svg>
              </button>
            </div>

            <div class="max-h-48 overflow-auto">
              <button
                v-for="p in filteredPantries"
                :key="p"
                class="w-full text-left px-5 py-2 hover:bg-white/10 border-t border-white/20 first:border-t-0"
                @click="choosePantry(p)"
              >
                {{ p }}
              </button>
            </div>

            <div class="border-t border-white/20 px-4 py-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#add-sign" />
              </svg>
              <input
                v-model="newPantryName"
                type="text"
                placeholder="Nueva Despensa"
                class="flex-1 bg-transparent placeholder-white/90 text-white outline-none"
              />
              <button class="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30" @click="addNewPantry">Agregar</button>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg bg-white/30 text-white hover:bg-white/40" @click="closeModal">Cancelar</button>
          <button class="px-4 py-2 rounded-lg bg-white text-gray-800 font-medium" @click="submitProduct">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>
