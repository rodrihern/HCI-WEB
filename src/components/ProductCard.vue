<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  icon: string
  name: string
  category: string
  description?: string
  image?: string
  onActionClick?: () => void
  actionIcon?: string
}>()

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div 
    class="bg-verde-claro rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
    :class="{ 'shadow-lg': isExpanded }"
    @click="toggleExpanded"
  >
    <!-- Borde cuando está expandido -->
    <div 
      v-if="isExpanded" 
      class="absolute inset-0 rounded-xl border-3 border-verde-contraste pointer-events-none"
    ></div>
    
    <div class="relative">
      <!-- Contenido compacto -->
      <div class="p-4 flex items-start gap-4">
        <!-- Imagen del producto (expandible) -->
        <div 
          class="flex-shrink-0 rounded-lg overflow-hidden bg-white/90 flex items-center justify-center transition-all duration-300"
          :class="isExpanded ? 'w-32 h-32' : 'w-16 h-16'"
        >
          <img 
            v-if="image" 
            :src="image" 
            :alt="name"
            class="w-full h-full object-cover"
          />
          <span v-else :class="isExpanded ? 'text-6xl' : 'text-3xl'" class="transition-all duration-300">{{ icon }}</span>
        </div>
        
        <!-- Nombre y categoría -->
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold t-body">{{ name }}</h3>
          <p class="text-white/80 t-caption">{{ category }}</p>
        </div>
        
        <!-- Botón de acción (si existe) -->
        <button 
          v-if="onActionClick"
          class="flex-shrink-0 p-2 hover:bg-verde-contraste/60 rounded-lg transition-colors"
          @click.stop="onActionClick"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor">
            <use :href="`@/assets/sprite.svg#${actionIcon || 'add-sign'}`" />
          </svg>
        </button>
        
        <!-- Slot para contenido personalizado (ej: controles de cantidad) -->
        <slot name="actions" />
        
        <!-- Indicador de expansión -->
        <div class="flex-shrink-0 ml-2">
          <svg 
            class="w-5 h-5 text-white transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Contenido expandido (descripción) -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="isExpanded" class="border-t border-white/20 px-4 pb-4 pt-3">
          <div v-if="description" class="bg-white/10 rounded-lg p-3">
            <p class="t-caption font-medium text-white/90 mb-1">Descripción:</p>
            <p class="text-white/80 t-caption leading-relaxed">{{ description }}</p>
          </div>
          <div v-else class="text-white/60 t-caption italic">
            Sin descripción
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
