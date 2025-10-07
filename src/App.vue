<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const isSidebarExpanded = ref(false)
const searchQuery = ref('')

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}
</script>

<template>
  <div v-if="route.path === '/login'" class="min-h-screen bg-[#FEFFF7]">
    <RouterView />
  </div>
  <div v-else class="flex h-screen bg-[#FEFFF7] relative">
    <!-- Navbar lateral -->
    <nav 
      class="bg-[#FEFFF7] flex flex-col relative transition-all duration-300 z-20"
      :class="isSidebarExpanded ? 'w-64 shadow-xl border border-gray-200' : 'w-24'"
    >
      <!-- Burger menu -->
      <div
        class="flex items-center px-4"
        :class="isSidebarExpanded ? '' : 'border-b border-gray-200'"
        style="height: 72px;"
      >
        <button 
          @click="toggleSidebar"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" stroke-width="2">
            <use href="@/assets/sprite.svg#hamburger-menu" />
          </svg>
        </button>
        <img v-if="isSidebarExpanded" src="@/assets/menu-logo.svg" alt="Menu logo" class="h-30 ml-5" />
      </div>

      <!-- Menu items -->
      <div class="flex flex-col items-start py-8 space-y-6">
        <RouterLink
          to="/listas"
          class="relative flex items-center w-full transition-all duration-200 rounded-r-full hover:bg-gray-200"
          :class="[
            'pl-4 pr-4 py-3 gap-4 h-16',
            isSidebarExpanded ? 'pl-4 pr-4' : 'w-16 px-0 justify-center',
            route.path === '/listas' ? 'bg-[#68AE6F]/50' : ''
          ]"
        >
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2">
              <use href="@/assets/sprite.svg#list-icon" />
            </svg>
          </div>
          <span v-if="isSidebarExpanded" class="text-gray-700 font-medium">Listas</span>
        </RouterLink>

        <RouterLink
          to="/productos"
          class="relative flex items-center w-full transition-all duration-200 rounded-r-full hover:bg-gray-200"
          :class="[
            'pl-4 pr-4 py-3 gap-4 h-16',
            isSidebarExpanded ? 'pl-4 pr-4' : 'w-16 px-0 justify-center',
            route.path === '/productos' ? 'bg-[#68AE6F]/50' : ''
          ]"
        >
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2">
              <use href="@/assets/sprite.svg#shopping-bag" />
            </svg>
          </div>
          <span v-if="isSidebarExpanded" class="text-gray-700 font-medium">Productos</span>
        </RouterLink>

        <RouterLink
          to="/despensa"
          class="relative flex items-center w-full transition-all duration-200 rounded-r-full hover:bg-gray-200"
          :class="[
            'pl-4 pr-4 py-3 gap-4 h-16',
            isSidebarExpanded ? 'pl-4 pr-4' : 'w-16 px-0 justify-center',
            route.path === '/despensa' ? 'bg-[#68AE6F]/50' : ''
          ]"
        >
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2">
              <use href="@/assets/sprite.svg#pantry-box" />
            </svg>
          </div>
          <span v-if="isSidebarExpanded" class="text-gray-700 font-medium">Despensa</span>
        </RouterLink>

        <RouterLink
          to="/historial"
          class="relative flex items-center w-full transition-all duration-200 rounded-r-full hover:bg-gray-200"
          :class="[
            'pl-4 pr-4 py-3 gap-4 h-16',
            isSidebarExpanded ? 'pl-4 pr-4' : 'w-16 px-0 justify-center',
            route.path === '/historial' ? 'bg-[#68AE6F]/50' : ''
          ]"
        >
          <div class="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2">
              <use href="@/assets/sprite.svg#clock-history" />
            </svg>
          </div>
          <span v-if="isSidebarExpanded" class="text-gray-700 font-medium">Historial</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Overlay when sidebar expanded -->
    <div
      v-if="isSidebarExpanded"
      class="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-10"
      @click="toggleSidebar"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-0">
      <!-- Top bar -->
      <header class="bg-[#FEFFF7] border-b border-gray-200 px-6 flex items-center justify-end relative" style="height: 72px;">
        <!-- Search bar -->
        <div class="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Hinted search text"
              class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#68AE6F] focus:border-transparent bg-white"
            />
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor">
                <use href="@/assets/sprite.svg#search" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Right side: Logo, Settings, Profile -->
        <div class="flex items-center gap-4 ml-6">
          <!-- Logo -->
          <span class="text-2xl font-bold text-[#68AE6F]">Listazo!</span>

          <!-- Settings -->
          <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#settings" />
            </svg>
          </button>

          <!-- Profile -->
          <button class="w-10 h-10 rounded-full bg-[#68AE6F] flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor">
              <use href="@/assets/sprite.svg#user-profile" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
