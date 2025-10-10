<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const sectionName = ref('')

const handleCreate = () => {
  if (sectionName.value.trim()) {
    emit('create', sectionName.value.trim())
    sectionName.value = ''
  }
}

const handleClose = () => {
  sectionName.value = ''
  emit('close')
}

// Reset form when modal is opened
watch(() => props.show, (newVal) => {
  if (newVal) {
    sectionName.value = ''
  }
})
</script>

<template>
  <BaseModal
    :show="show"
    title="Nueva sección de despensa"
    max-width="lg"
    height="auto"
    @close="handleClose"
  >
    <div class="p-8">
      <!-- Input para el nombre de la sección -->
      <div class="mb-6">
        <label for="section-name" class="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la sección
        </label>
        <input
          id="section-name"
          v-model="sectionName"
          type="text"
          placeholder="Ej: Verdulería, Carnicería, etc."
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
          @keyup.enter="handleCreate"
          autofocus
        />
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleCreate"
          :disabled="!sectionName.trim()"
          class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear
        </button>
      </div>
    </div>
  </BaseModal>
</template>
