<script setup lang="ts">
import { computed } from 'vue'
import { useListsStore } from '../stores/lists'

const store = useListsStore()

const historyByStore = computed(() => {
  const grouped: Record<string, typeof store.history> = {}
  store.history.forEach((item) => {
    const storeGroup = grouped[item.store] || []
    storeGroup.push(item)
    grouped[item.store] = storeGroup
  })
  return grouped
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="py-6 px-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">Mis compras</h1>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="(items, storeName) in historyByStore" :key="storeName">
        <h3 class="text-base font-medium text-gray-600 mb-3">{{ storeName }}</h3>
        <div class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="bg-[#8DAF7E] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-semibold">{{ item.listName }}</h3>
                <p class="text-white text-sm opacity-90">{{ formatDate(item.date) }}</p>
              </div>
              <button class="text-white hover:text-gray-200 transition-colors p-2">
                <svg class="w-5 h-5" fill="currentColor">
                  <use href="@/assets/sprite.svg#three-dots" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.history.length === 0" class="text-center text-gray-500 mt-12">
      <p class="text-lg">No tienes historial todavía</p>
      <p class="text-sm">Tus compras aparecerán aquí</p>
    </div>
  </div>
</template>
