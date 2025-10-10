<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMain = () => {
  router.push('/listas')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-fondo p-2 sm:p-4 lg:p-8">
    <!-- Main container - one big box -->
    <div class="flex flex-col lg:flex-row w-full max-w-7xl h-auto lg:h-[85vh] max-h-[900px] bg-white rounded-3xl shadow-xl overflow-hidden">
      <!-- Left side - Green rectangle with logo and illustration -->
      <div class="w-full lg:w-1/2 bg-verde-sidebar flex flex-col items-center justify-center py-6 px-4 min-h-[300px] lg:min-h-0">
        <div class="text-center mb-4">
          <svg class="w-32 sm:w-48 lg:w-64 h-8 sm:h-12 lg:h-16 mx-auto">
            <use href="@/assets/sprite.svg#logo" />
          </svg>
        </div>
        
        <!-- Logo image - Large size -->
        <div class="flex-1 flex items-center justify-center w-full mb-4">
          <img src="@/assets/logo_login.svg" alt="Listazo Logo" class="w-48 sm:w-64 lg:w-80 xl:w-96 h-auto max-w-full object-contain" />
        </div>
      
        <div class="text-center pb-4">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white px-4">No vuelvas a olvidar nada.</h2>
        </div>
      </div>

      <!-- Right side - Register form -->
      <div class="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-0">
        <div class="w-full max-w-md">
          <div class="text-center mb-6 lg:mb-8">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          </div>

          <div class="space-y-3 sm:space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Apellido"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Contraseña"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
            />

            <button
              @click="goToMain"
              class="w-full bg-verde-sidebar hover:bg-verde-contraste text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 rounded-full transition-colors"
            >
              Registrarse
            </button>

            <div class="text-center text-sm pt-1">
              <span class="text-gray-700">¿Ya tenés una cuenta? </span>
              <a @click="goToLogin" class="font-bold text-gray-900 hover:text-verde-sidebar cursor-pointer">Iniciá Sesión</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
