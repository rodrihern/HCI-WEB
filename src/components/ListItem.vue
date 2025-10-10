<script setup lang="ts">
import { ref } from 'vue'
import QuantityControls from './QuantityControls.vue'

interface Props {
  /** Texto principal del item */
  title: string
  /** Texto secundario (opcional) */
  subtitle?: string
  /** Icono o emoji a mostrar a la izquierda (opcional) */
  icon?: string
  /** Mostrar controles de cantidad */
  showQuantityControls?: boolean
  /** Cantidad actual (si showQuantityControls es true) */
  quantity?: number
  /** Clases adicionales para el contenedor */
  class?: string
  /** Mostrar animación de escala */
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
}>()

const handleQuantityChange = (change: number) => {
  emit('quantityChange', change)
}
</script>

<template>
  <div
    class="bg-verde-claro rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative"
    :class="[props.class, { 'scale-[1.02] shadow-lg': isAnimating }]"
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

      <!-- Lado derecho: Controles -->
      <div class="flex items-center gap-3" @click.stop>
        <!-- Controles de cantidad (para DespensaView) -->
        <QuantityControls
          v-if="showQuantityControls"
          :quantity="quantity"
          @increment="handleQuantityChange(1)"
          @decrement="handleQuantityChange(-1)"
        />

        <!-- Slot para acciones personalizadas (estrella, menú contextual, etc) -->
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
