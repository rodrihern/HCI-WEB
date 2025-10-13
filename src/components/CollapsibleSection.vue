<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  isCollapsed?: boolean
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
          class="flex items-center hover:cursor-pointer justify-center w-8 h-8 hover:bg-gray-50 rounded-lg transition-colors"
          :aria-label="collapsed ? `Expandir sección ${title}` : `Colapsar sección ${title}`"
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
