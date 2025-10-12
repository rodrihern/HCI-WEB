<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'

interface Props {
  show: boolean
  productName: string
  productId?: number
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [details: { quantity: number; unit: string; description: string }]
}>()

const quantity = ref(1)
const unit = ref('unidad')
const description = ref('')

const units = [
  'unidad',
  'kg',
  'g',
  'l',
  'ml',
  'paquete',
  'caja',
  'docena'
]

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    quantity.value = 1
    unit.value = 'unidad'
    description.value = ''
  }
})

const closeModal = () => {
  emit('close')
}

const confirmAdd = () => {
  emit('confirm', {
    quantity: quantity.value,
    unit: unit.value,
    description: description.value
  })
  closeModal()
}

const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Añadir Producto"
    max-width="lg"
    height="auto"
    @close="closeModal"
  >
    <div class="p-6 bg-gray-50">
      <!-- Product Name -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Producto</label>
        <div class="bg-white rounded-xl px-4 py-3 border-2 border-gray-200">
          <p class="text-lg font-semibold text-gray-800">{{ productName }}</p>
        </div>
      </div>

      <!-- Quantity -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
        <div class="flex justify-center">
          <QuantityControls
            :quantity="quantity"
            @increment="incrementQuantity"
            @decrement="decrementQuantity"
          />
        </div>
      </div>

      <!-- Unit -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Unidad</label>
        <select 
          v-model="unit"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
        >
          <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>

      <!-- Description -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</label>
        <textarea 
          v-model="description"
          placeholder="Agrega notas o especificaciones..."
          rows="3"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white resize-none"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button 
          @click="closeModal"
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="confirmAdd"
          :disabled="isLoading"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Añadiendo...' : 'Añadir a Lista' }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
