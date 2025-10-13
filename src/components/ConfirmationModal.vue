<script setup lang="ts">
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmar acción',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const variantStyles = {
  danger: {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    confirmBg: 'bg-red-600 hover:bg-red-700',
    confirmText: 'text-white'
  },
  warning: {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    confirmText: 'text-white'
  },
  info: {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    confirmBg: 'bg-verde-sidebar hover:bg-verde-contraste',
    confirmText: 'text-white'
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="title"
    max-width="lg"
    height="auto"
    @close="handleCancel"
  >
    <div class="p-8">
      <!-- Icono y mensaje -->
      <div class="flex items-start gap-4 mb-6">
        <!-- Icono -->
        <div :class="[variantStyles[variant].iconBg, 'rounded-full p-3 flex-shrink-0']">
          <svg 
            :class="[variantStyles[variant].iconColor, 'w-6 h-6']"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              :d="variantStyles[variant].icon"
            />
          </svg>
        </div>

        <!-- Mensaje -->
        <div class="flex-1 pt-1">
          <p class="text-gray-800 text-lg leading-relaxed">{{ message }}</p>
          <slot name="details"></slot>
        </div>
      </div>

      <!-- Contenido adicional opcional -->
      <slot></slot>

      <!-- Botones de acción -->
      <div class="flex justify-end gap-3 mt-6">
        <button 
          @click="handleCancel"
          class="px-6 py-2.5 rounded-xl bg-gray-200 hover:cursor-pointer hover:bg-gray-300 text-gray-800 font-medium transition-colors"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          :class="[
            variantStyles[variant].confirmBg,
            variantStyles[variant].confirmText,
            'px-6 py-2.5 rounded-xl hover:cursor-pointer font-medium transition-colors'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
