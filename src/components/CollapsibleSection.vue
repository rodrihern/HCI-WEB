<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  isCollapsed?: boolean
  showAddButton?: boolean
  addButtonText?: string
  onAddClick?: () => void
  showShareButton?: boolean
  shareButtonText?: string
  onShareClick?: () => void
}>()

const emit = defineEmits<{
  'update:isCollapsed': [value: boolean]
}>()

const collapsed = ref(props.isCollapsed ?? false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('update:isCollapsed', collapsed.value)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <button
          @click="toggleCollapse"
          class="flex items-center justify-center w-8 h-8 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg 
            class="w-5 h-5 text-gray-600 transition-transform duration-200 origin-center"
            :class="{ 'rotate-180': !collapsed }"
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <h2 class="text-base font-medium text-gray-700">{{ title }}</h2>
      </div>
      
      <div v-if="(showAddButton && onAddClick) || (showShareButton && onShareClick)" class="flex items-center gap-2">
        <button
          v-if="showAddButton && onAddClick"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-verde-sidebar text-white rounded-xl hover:bg-verde-contraste transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          @click="onAddClick"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ addButtonText || 'Agregar' }}
        </button>
        
        <button
          v-if="showShareButton && onShareClick"
          class="flex items-center justify-center py-2.5 px-3 bg-verde-sidebar text-white rounded-xl hover:bg-verde-contraste transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          @click="onShareClick"
          :title="shareButtonText || 'Compartir'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="!collapsed" class="overflow-visible">
        <slot />
      </div>
    </transition>
  </div>
</template>
