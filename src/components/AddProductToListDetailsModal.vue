<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import BaseModal from './BaseModal.vue'
import QuantityControls from './QuantityControls.vue'

interface Props {
  show: boolean
  productName: string
  productId?: number
  productImage?: string
  productIcon?: string
  productCategory?: string
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
const showUnitDropdown = ref(false)

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
    showUnitDropdown.value = false
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

const selectUnit = (selectedUnit: string) => {
  unit.value = selectedUnit
  showUnitDropdown.value = false
}

const toggleUnitDropdown = () => {
  showUnitDropdown.value = !showUnitDropdown.value
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.unit-dropdown')) {
    showUnitDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
      <!-- Product Card -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Producto</label>
        <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
          <div class="flex items-center gap-4">
            <!-- Product Image/Icon -->
            <div class="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                v-if="productImage" 
                :src="productImage" 
                :alt="productName"
                class="w-full h-full object-cover rounded-lg"
              />
              <span v-else class="text-3xl">{{ productIcon || '📦' }}</span>
            </div>
            
            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-800 truncate">{{ productName }}</h3>
              <p v-if="productCategory" class="text-sm text-gray-500 truncate">{{ productCategory }}</p>
            </div>
          </div>
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
        <div class="relative unit-dropdown">
          <button
            @click="toggleUnitDropdown"
            class="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-all duration-200 text-gray-800 bg-white cursor-pointer hover:border-gray-400 hover:shadow-sm text-left flex items-center justify-between"
          >
            <span>{{ unit }}</span>
            <svg 
              class="w-5 h-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': showUnitDropdown }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Custom dropdown options -->
          <div 
            v-if="showUnitDropdown"
            class="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            <button
              v-for="u in units"
              :key="u"
              @click="selectUnit(u)"
              class="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors duration-150 flex items-center justify-between group"
              :class="{ 'bg-verde-sidebar text-white hover:bg-verde-contraste': unit === u }"
            >
              <span class="font-medium">{{ u }}</span>
              <svg 
                v-if="unit === u"
                class="w-4 h-4 text-white"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
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

<style scoped>
/* Custom dropdown animations */
.unit-dropdown button svg {
  transition: transform 0.2s ease-in-out;
}

/* Smooth dropdown appearance */
.unit-dropdown > div {
  animation: dropdownFadeIn 0.15s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced hover effects */
.unit-dropdown button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Focus state enhancement */
.unit-dropdown button:focus {
  box-shadow: 0 0 0 3px rgba(104, 174, 111, 0.1);
  outline: none;
}
</style>
