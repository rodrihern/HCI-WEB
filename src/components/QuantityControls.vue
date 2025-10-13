<script setup lang="ts">
interface Props {
  quantity: number
  class?: string
  showBackground?: boolean
  buttonClass?: string
  quantityClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  showBackground: true,
  buttonClass: 'text-gray-600 hover:text-verde-sidebar hover:cursor-pointer font-bold text-xl w-8 h-8 flex items-center justify-center',
  quantityClass: 'text-gray-800 font-bold min-w-[3rem] text-center text-lg'
})

const emit = defineEmits<{
  increment: []
  decrement: []
}>()

const handleIncrement = () => {
  emit('increment')
}

const handleDecrement = () => {
  emit('decrement')
}
</script>

<template>
  <div class="flex items-center gap-3" :class="[props.class, { 'bg-gray-100 rounded-xl px-3 py-2': showBackground }]">
    <button
      @click="handleDecrement"
      :class="buttonClass"
      aria-label="Disminuir cantidad"
    >
      −
    </button>
    <span :class="quantityClass">{{ quantity }}</span>
    <button
      @click="handleIncrement"
      :class="buttonClass"
      aria-label="Aumentar cantidad"
    >
      +
    </button>
  </div>
</template>