<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const predefinedUnits = ['unidad', 'kilo', 'litro']
const customUnit = ref('')
const isCustom = ref(false)

// Check if current value is custom
watch(() => props.modelValue, (newValue) => {
  if (!predefinedUnits.includes(newValue) && newValue) {
    isCustom.value = true
    customUnit.value = newValue
  }
}, { immediate: true })

const selectUnit = (unit: string) => {
  isCustom.value = false
  customUnit.value = ''
  emit('update:modelValue', unit)
}

const enableCustomInput = () => {
  isCustom.value = true
  customUnit.value = props.modelValue && !predefinedUnits.includes(props.modelValue) ? props.modelValue : ''
}

const updateCustomUnit = () => {
  if (customUnit.value.trim()) {
    emit('update:modelValue', customUnit.value.trim())
  }
}
</script>

<template>
  <div>
    <!-- Predefined units as chips -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="unit in predefinedUnits"
        :key="unit"
        type="button"
        @click="selectUnit(unit)"
        class="px-4 py-2 rounded-full hover:cursor-pointer font-medium whitespace-nowrap transition-colors"
        :class="modelValue === unit && !isCustom
          ? 'bg-verde-sidebar text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
      >
        {{ unit }}
      </button>
      <button
        type="button"
        @click="enableCustomInput"
        class="px-4 py-2 rounded-full hover:cursor-pointer ront-medium whitespace-nowrap transition-colors"
        :class="isCustom
          ? 'bg-verde-sidebar text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
      >
        Otra...
      </button>
    </div>

    <!-- Custom unit input -->
    <div v-if="isCustom" class="mt-2">
      <input
        v-model="customUnit"
        @blur="updateCustomUnit"
        @keyup.enter="updateCustomUnit"
        type="text"
        placeholder="Escribe la unidad"
        class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-verde-sidebar focus:outline-none focus:ring-2 focus:ring-verde-sidebar transition-colors"
      />
    </div>
  </div>
</template>
