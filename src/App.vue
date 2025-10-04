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
  <div class="flex h-screen bg-[#FEFFF7]">
    <!-- Navbar lateral -->
    <nav
      class="bg-[#68AE6F] flex flex-col transition-all duration-300 shadow-lg"
      :class="isSidebarExpanded ? 'w-56' : 'w-20'"
    >
      <div class="p-4">
        <!-- Logo y Menu toggle -->
        <div class="flex items-center justify-between mb-8">
          <button
            @click="toggleSidebar"
            class="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div v-if="isSidebarExpanded" class="flex items-center gap-2">
          </div>
        </div>

        <!-- Menu items -->
        <div class="space-y-2">
          <RouterLink
            to="/listas"
            class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border-2"
            :class="
              route.path === '/listas'
                ? 'border-[#B8D4AD] bg-[#B8D4AD] bg-opacity-20'
                : 'border-transparent hover:bg-white hover:bg-opacity-10'
            "
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span
              v-if="isSidebarExpanded"
              class="text-white font-medium whitespace-nowrap"
            >
              Listas
            </span>
          </RouterLink>

          <RouterLink
            to="/productos"
            class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border-2"
            :class="
              route.path === '/productos'
                ? 'border-[#B8D4AD] bg-[#B8D4AD] bg-opacity-20'
                : 'border-transparent hover:bg-white hover:bg-opacity-10'
            "
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span
              v-if="isSidebarExpanded"
              class="text-white font-medium whitespace-nowrap"
            >
              Productos
            </span>
          </RouterLink>

          <RouterLink
            to="/despensa"
            class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border-2"
            :class="
              route.path === '/despensa'
                ? 'border-[#B8D4AD] bg-[#B8D4AD] bg-opacity-20'
                : 'border-transparent hover:bg-white hover:bg-opacity-10'
            "
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span
              v-if="isSidebarExpanded"
              class="text-white font-medium whitespace-nowrap"
            >
              Despensa
            </span>
          </RouterLink>

          <RouterLink
            to="/historial"
            class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border-2"
            :class="
              route.path === '/historial'
                ? 'border-[#B8D4AD] bg-[#B8D4AD] bg-opacity-20'
                : 'border-transparent hover:bg-white hover:bg-opacity-10'
            "
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              v-if="isSidebarExpanded"
              class="text-white font-medium whitespace-nowrap"
            >
              Historial
            </span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-[#FEFFF7] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <!-- Search bar -->
        <div class="flex-1 max-w-2xl">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Hinted search text"
              class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#68AE6F] focus:border-transparent bg-white"
            />
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <!-- Profile -->
          <button class="w-10 h-10 rounded-full bg-[#68AE6F] flex items-center justify-center hover:opacity-80 transition-opacity">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
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
