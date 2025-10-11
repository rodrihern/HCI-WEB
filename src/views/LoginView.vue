<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores2/user';

const router = useRouter();
const userStore = useUserStore();

// Form fields
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

// UI state
const loading = ref(false);
const error = ref('');

const goToRegister = () => {
  router.push('/register');
};

const validateForm = (): boolean => {
  error.value = '';

  if (!email.value.trim()) {
    error.value = 'El email es requerido';
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    error.value = 'El email no es válido';
    return false;
  }

  if (!password.value) {
    error.value = 'La contraseña es requerida';
    return false;
  }

  return true;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    await userStore.login(
      {
        email: email.value.trim(),
        password: password.value
      },
      rememberMe.value
    );

    // Redirect to main app
    router.push('/listas');
  } catch (e: any) {
    console.error('Login error:', e);
    error.value = e.message || 'Email o contraseña incorrectos. Por favor, intentá de nuevo.';
  } finally {
    loading.value = false;
  }
};

// TODO: Implement forgot password flow
const handleForgotPassword = () => {
  console.log('Forgot password clicked');
  // You can implement this later with UserApi.forgotPassword
};
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

      <!-- Right side - Login form -->
      <div class="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-0">
        <div class="w-full max-w-md">
          <div class="text-center mb-6 lg:mb-8">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          </div>

          <!-- Error message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600 text-center">{{ error }}</p>
          </div>

          <div class="space-y-3 sm:space-y-4">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              :disabled="loading"
              @keyup.enter="handleLogin"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              :disabled="loading"
              @keyup.enter="handleLogin"
              class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center cursor-pointer">
                <input 
                  v-model="rememberMe"
                  type="checkbox" 
                  :disabled="loading"
                  class="mr-2 rounded cursor-pointer disabled:cursor-not-allowed"
                >
                <span class="text-gray-700">Recordarme</span>
              </label>
              <a 
                @click="handleForgotPassword" 
                class="font-semibold text-gray-900 hover:text-verde-sidebar cursor-pointer"
              >
                Recuperar Contraseña
              </a>
            </div>

            <button
              @click="handleLogin"
              :disabled="loading"
              class="w-full bg-verde-sidebar hover:bg-verde-contraste text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!loading">Iniciar Sesión</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            </button>

            <div class="text-center text-sm pt-1">
              <span class="text-gray-700">¿No tenés una cuenta? </span>
              <a @click="goToRegister" class="font-bold text-gray-900 hover:text-verde-sidebar cursor-pointer">Regístrate</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
