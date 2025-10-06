<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMain = () => {
  router.push('/listas')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FEFFF7] p-8">
    <!-- Main container - one big box -->
    <div class="flex w-full max-w-7xl h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden">
      <!-- Left side - Green rectangle with logo and illustration -->
      <div class="w-1/2 bg-[#68AE6F] flex flex-col items-center justify-between py-16 px-8">
        <div class="text-center">
          <svg class="w-80 h-20 mx-auto mb-16">
            <use href="@/assets/sprite.svg#logo" />
          </svg>
        
        <!-- Shopping cart illustration -->
        <div class="flex items-center justify-center mb-8">
          <svg class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <use href="@/assets/sprite.svg#login-logo" />
          </svg>
        </div>
      </div>
      
      <div class="text-center">
        <h2 class="text-3xl font-bold text-white">No vuelvas a olvidar nada.</h2>
      </div>
    </div>

      <!-- Right side - Login form -->
      <div class="w-1/2 bg-white flex items-center justify-center px-8">
        <div class="w-full max-w-md">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          </div>

          <div class="space-y-6">
            <input
              type="email"
              placeholder="Email"
              class="w-full px-6 py-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#68AE6F] focus:border-transparent text-lg"
            />
            <input
              type="password"
              placeholder="Contraseña"
              class="w-full px-6 py-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#68AE6F] focus:border-transparent text-lg"
            />
            
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center">
                <input type="checkbox" class="mr-2 rounded">
                <span class="text-gray-700">Recordarme</span>
              </label>
              <a href="#" class="font-semibold text-gray-900 hover:text-[#68AE6F]">Recuperar Contraseña</a>
            </div>

            <button
              @click="goToMain"
              class="w-full bg-[#68AE6F] hover:bg-[#5aa063] text-white font-semibold py-4 rounded-full transition-colors text-lg"
            >
              Iniciar Sesión
            </button>

            <div class="text-center text-sm">
              <span class="text-gray-700">¿No tenés una cuenta? </span>
              <a href="#" class="font-bold text-gray-900 hover:text-[#68AE6F]">Regístrate</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>


