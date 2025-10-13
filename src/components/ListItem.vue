<script setup lang="ts">
import { ref } from 'vue'
import QuantityControls from './QuantityControls.vue'

interface Props {
  title: string
  subtitle?: string
  icon?: string
  showQuantityControls?: boolean
  quantity?: number
  class?: string
  isAnimating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: '',
  showQuantityControls: false,
  quantity: 0,
  class: '',
  isAnimating: false
})

const emit = defineEmits<{
  quantityChange: [change: number]
  click: []
}>()

const hasOpenMenu = ref(false)

const handleQuantityChange = (change: number) => {
  emit('quantityChange', change)
}

const handleClick = () => {
  emit('click')
}

const handleMenuStateChange = (isOpen: boolean) => {
  hasOpenMenu.value = isOpen
}
</script>

<template>
  <div
    class="bg-verde-claro rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative"
    :class="[
      props.class, 
      { 
        'scale-[1.02] shadow-lg': isAnimating,
        'z-50': hasOpenMenu
      }
    ]"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <!-- Lado izquierdo: Icono y textos -->
      <div class="flex items-center gap-3 flex-1">
        <span v-if="icon" class="text-2xl">{{ icon }}</span>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-white font-semibold" :class="subtitle ? 'text-lg' : 'text-base'">
              {{ title }}
            </h3>
          </div>
          <p v-if="subtitle" class="text-white text-sm opacity-90">{{ subtitle }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3" @click.stop>
        <QuantityControls
          v-if="showQuantityControls"
          :quantity="quantity"
          @increment="handleQuantityChange(1)"
          @decrement="handleQuantityChange(-1)"
        />

        <slot name="actions" :on-menu-state-change="handleMenuStateChange" />
      </div>
    </div>
  </div>
</template>
