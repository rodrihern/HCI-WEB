<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  isCollapsed?: boolean
  showAddButton?: boolean
  addButtonText?: string
  onAddClick?: () => void
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
      <button
        @click="toggleCollapse"
        class="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
      >
        <h2 class="text-base font-medium text-gray-700">{{ title }}</h2>
        <svg 
          class="w-5 h-5 text-gray-600 transition-transform duration-200"
          :class="{ 'rotate-180': !collapsed }"
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <button
        v-if="showAddButton && onAddClick"
        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50"
        @click="onAddClick"
      >
        {{ addButtonText || 'Agregar' }}
      </button>
    </div>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="!collapsed" class="overflow-hidden">
        <slot />
      </div>
    </transition>
  </div>
</template>
