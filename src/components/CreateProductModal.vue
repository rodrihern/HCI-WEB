<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '@/stores/lists'
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const store = useListsStore()

// Modal state
const productName = ref('')
const productDescription = ref('')
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

const closeModal = () => {
  productName.value = ''
  productDescription.value = ''
  selectedCategory.value = ''
  categorySearch.value = ''
  newCategoryName.value = ''
  selectedPantry.value = ''
  pantrySearch.value = ''
  newPantryName.value = ''
  selectedFile.value = null
  isCategoryOpen.value = false
  isPantryOpen.value = false
  emit('close')
}

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

const submitProduct = async () => {
  const name = productName.value.trim()
  const category = selectedCategory.value.trim()
  const pantry = selectedPantry.value.trim()
  const description = productDescription.value.trim()
  if (!name || !category) return
  
  let imageBase64 = undefined
  if (selectedFile.value) {
    // Convert image to base64
    const reader = new FileReader()
    imageBase64 = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(selectedFile.value!)
    })
  }
  
  store.addProduct({ 
    name, 
    category, 
    pantry: pantry || undefined, 
    icon: '🛒',
    description: description || undefined,
    image: imageBase64
  })
  closeModal()
}
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Nuevo Producto"
    max-width="3xl"
    height="auto"
    @close="closeModal"
  >
    <!-- Contenido del modal de producto -->
    <div class="p-8 space-y-4 bg-gray-50">
      <!-- Name input -->
      <div>
        <input
          v-model="productName"
          type="text"
          placeholder="Nombre del producto"
          class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
        />
      </div>

       <!-- Category selector -->
      <div class="relative">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 hover:border-verde-sidebar transition-colors"
          @click="isCategoryOpen = !isCategoryOpen"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor">
            <use href="@/assets/sprite.svg#search" />
          </svg>
          <span class="flex-1 text-left text-lg">{{ selectedCategory || 'Categoría' }}</span>
          <span 
            v-if="selectedCategory"
            class="p-1 -mr-1 cursor-pointer hover:bg-gray-100 rounded transition-colors" 
            @click.stop="selectedCategory = ''" 
            aria-label="clear"
          >
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#close" />
            </svg>
          </span>
        </button>

        <div
          v-if="isCategoryOpen"
          class="absolute left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-xl overflow-hidden z-10"
          @click.stop
        >
          <div class="px-4 py-3 bg-gray-50 flex items-center gap-2 border-b border-gray-200">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#search" />
            </svg>
            <input
              v-model="categorySearch"
              type="text"
              placeholder="Buscar categoría"
              class="flex-1 bg-transparent placeholder-gray-500 text-gray-800 outline-none"
            />
            <span 
              v-if="categorySearch"
              class="p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors" 
              @click="categorySearch = ''"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#close" />
              </svg>
            </span>
          </div>

          <div class="max-h-48 overflow-auto">
            <button
              v-for="c in filteredCategories"
              :key="c"
              class="w-full text-left px-5 py-3 hover:bg-verde-claro hover:text-white border-b border-gray-100 last:border-b-0 transition-colors text-gray-800"
              @click="chooseCategory(c)"
            >
              {{ c }}
            </button>
            <div v-if="filteredCategories.length === 0 && categorySearch" class="px-5 py-4 text-center text-gray-500 text-sm">
              No se encontraron categorías
            </div>
          </div>

          <div class="border-t-2 border-gray-200 px-4 py-3 flex items-center gap-2 bg-gray-50">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="Nueva categoría"
              class="flex-1 bg-transparent placeholder-gray-500 text-gray-800 outline-none"
              @keyup.enter="addNewCategory"
            />
            <button 
              class="px-4 py-2 bg-verde-sidebar text-white rounded-lg hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              :disabled="!newCategoryName.trim()"
              @click="addNewCategory"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>


      <!-- Description input -->
      <div>
        <div class="relative">
          <textarea
            v-model="productDescription"
            maxlength="200"
            placeholder="Descripción del producto (opcional)"
            class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white resize-none"
            rows="3"
          ></textarea>
          <div class="absolute bottom-3 right-4 text-sm text-gray-400">
            {{ productDescription.length }}/200
          </div>
        </div>
      </div>

      <!-- Media drop area -->
      <label class="block">
        <div class="w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-verde-sidebar hover:text-verde-sidebar transition-colors bg-white">
          <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor">
            <use href="@/assets/sprite.svg#image" />
          </svg>
          <span class="text-sm font-medium">Añadir Multimedia</span>
          <span v-if="selectedFile" class="text-xs mt-1 text-verde-sidebar">{{ selectedFile.name }}</span>
        </div>
        <input type="file" class="hidden" @change="onFileChange" accept="image/*" />
      </label>


      <!-- Botones de acción -->
      <div class="flex justify-end gap-3 pt-4">
        <button 
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors" 
          @click="closeModal"
        >
          Cancelar
        </button>
        <button 
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          :disabled="!productName.trim() || !selectedCategory.trim()"
          @click="submitProduct"
        >
          Guardar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
