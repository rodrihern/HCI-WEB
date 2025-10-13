<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'

type ItemType = 'list' | 'pantry'

interface Props {
  show: boolean
  type: ItemType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const itemName = ref('')

const itemTypeLabel = computed(() => props.type === 'list' ? 'lista' : 'despensa')
const itemTypeLabelCapitalized = computed(() => props.type === 'list' ? 'Lista' : 'Despensa')
const placeholderText = computed(() => 
  props.type === 'list' 
    ? 'Ej: Supermercado, Fin de semana, etc.' 
    : 'Ej: Verdulería, Carnicería, etc.'
)

const handleCreate = () => {
  if (itemName.value.trim()) {
    emit('create', itemName.value.trim())
    itemName.value = ''
  }
}

const handleClose = () => {
  itemName.value = ''
  emit('close')
}

// Reset form when modal is opened
watch(() => props.show, (newVal) => {
  if (newVal) {
    itemName.value = ''
  }
})
</script>

<template>
  <BaseModal
    :show="show"
    :title="`Nueva ${itemTypeLabel}`"
    max-width="xl"
    height="auto"
    @close="handleClose"
  >
    <div class="p-4">
      <!-- Input para el nombre -->
      <div class="mb-6">
        <label for="item-name" class="block font-medium text-gray-700 mb-2">
          Nombre de la {{ itemTypeLabel }}
        </label>
        <input
          id="item-name"
          v-model="itemName"
          type="text"
          :placeholder="placeholderText"
          maxlength="25"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
          @keyup.enter="handleCreate"
          autofocus
        />
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-6 py-2.5 hover:cursor-pointer rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          aria-label="Cancelar creación de nueva lista"
        >
          Cancelar
        </button>
        <button
          @click="handleCreate"
          :disabled="!itemName.trim()"
          class="px-6 py-2.5 hover:cursor-pointer rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-label="`Crear nueva ${itemTypeLabel}`"
        >
          Crear {{ itemTypeLabelCapitalized }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
