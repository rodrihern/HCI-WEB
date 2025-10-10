<script setup lang="ts">
import { ref } from 'vue'
import ContextMenu, { type ContextMenuItem } from './ContextMenu.vue'

interface Props {
  icon: string
  name: string
  category: string
  description?: string
  image?: string
  productId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
  edit: [id: string]
  addToList: [id: string]
}>()

const isExpanded = ref(false)
const showContextMenu = ref(false)

const toggleExpanded = () => {
  // Cerrar el menú contextual si está abierto
  if (showContextMenu.value) {
    showContextMenu.value = false
    return
  }
  // Toggle expandir/colapsar
  isExpanded.value = !isExpanded.value
}

const toggleContextMenu = (event: Event) => {
  event.stopPropagation()
  showContextMenu.value = !showContextMenu.value
}

const contextMenuItems: ContextMenuItem[] = [
  {
    label: 'Añadir a lista',
    onClick: () => {
      showContextMenu.value = false
      emit('addToList', props.productId)
    }
  },
  {
    label: 'Editar',
    onClick: () => {
      showContextMenu.value = false
      emit('edit', props.productId)
    }
  },
  {
    label: 'Eliminar',
    onClick: () => {
      showContextMenu.value = false
      emit('delete', props.productId)
    },
    variant: 'danger'
  }
]
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
          <h3 class="text-white font-semibold text-lg">{{ name }}</h3>
          <p class="text-white/80 text-sm">{{ category }}</p>
        </div>
        
        <!-- Menú contextual -->
        <div class="relative flex-shrink-0">
          <button 
            class="p-2 hover:bg-verde-contraste/60 rounded-lg transition-colors"
            @click="toggleContextMenu"
            aria-label="Opciones"
          >
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          <ContextMenu 
            :show="showContextMenu"
            :items="contextMenuItems"
          />
        </div>
      </div>
      
      <!-- Contenido expandido (descripción) -->
      <div 
        class="grid transition-all duration-300 ease-in-out overflow-hidden"
        :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div class="min-h-0">
          <div class="border-t border-white/20 px-4 pb-4 pt-3">
            <div v-if="description" class="bg-white/10 rounded-lg p-3">
              <p class="text-sm font-medium text-white/90 mb-1">Descripción:</p>
              <p class="text-white/80 text-sm leading-relaxed">{{ description }}</p>
            </div>
            <div v-else class="text-white/60 text-sm italic">
              Sin descripción
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
