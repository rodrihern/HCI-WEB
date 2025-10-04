<template>
  <div class="app">
    <SideBar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f9fafb;
  color: #1f2937;
  line-height: 1.6;
}

.app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

/* Responsive adjustments for collapsed sidebar */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 240px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
  }
}

/* Global button styles */
button {
  font-family: inherit;
}

button:focus {
  outline: none;
}

/* Global input styles */
input,
select,
textarea {
  font-family: inherit;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
