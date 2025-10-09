<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; category: string }]
}>()

const productName = ref('')
const selectedCategory = ref('')

const closeModal = () => {
  productName.value = ''
  selectedCategory.value = ''
  emit('close')
}

const submitProduct = () => {
  if (productName.value.trim() && selectedCategory.value.trim()) {
    emit('submit', {
      name: productName.value.trim(),
      category: selectedCategory.value.trim()
    })
    closeModal()
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Nuevo Producto"
    max-width="md"
    height="auto"
    @close="closeModal"
  >
    <!-- Contenido personalizado del modal de producto -->
    <div class="p-8 space-y-6">
      <!-- Input nombre -->
      <div>
        <label class="block text-lg font-semibold text-gray-800 mb-2">Nombre del Producto</label>
        <input 
          v-model="productName"
          type="text" 
          placeholder="Ej: Leche, Pan, etc."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
        />
      </div>

      <!-- Input categoría -->
      <div>
        <label class="block text-lg font-semibold text-gray-800 mb-2">Categoría</label>
        <input 
          v-model="selectedCategory"
          type="text" 
          placeholder="Ej: Lácteos, Panadería, etc."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800"
        />
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-end gap-3 pt-4">
        <button 
          @click="closeModal"
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="submitProduct"
          :disabled="!productName.trim() || !selectedCategory.trim()"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
