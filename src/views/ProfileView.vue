<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores2/user';
import { UserApi } from '@/api/user';

const router = useRouter();
const userStore = useUserStore();

const profileData = ref({
  name: '',
  surname: '',
  email: '',
  avatar: null as string | null
});

const isEditingName = ref(false);
const isEditingSurname = ref(false);
const tempName = ref('');
const tempSurname = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// Load user profile on mount
onMounted(async () => {
  await loadProfile();
});

const loadProfile = async () => {
  try {
    loading.value = true;
    const user = await userStore.getProfile();
    profileData.value.name = user.name;
    profileData.value.surname = user.surname;
    profileData.value.email = user.email;
  } catch (e: any) {
    console.error('Error loading profile:', e);
    error.value = 'Error al cargar el perfil';
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.value.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(target.files[0]);
  }
};

const triggerFileInput = () => {
  const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
  fileInput?.click();
};

const startEditingName = () => {
  isEditingName.value = true;
  tempName.value = profileData.value.name;
};

const saveName = async () => {
  if (!tempName.value.trim()) {
    error.value = 'El nombre no puede estar vacío';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    success.value = '';

    await UserApi.updateProfile({
      name: tempName.value.trim(),
      surname: profileData.value.surname
    });

    profileData.value.name = tempName.value.trim();
    isEditingName.value = false;
    success.value = 'Nombre actualizado exitosamente';

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e: any) {
    console.error('Error updating name:', e);
    error.value = e.message || 'Error al actualizar el nombre';
  } finally {
    loading.value = false;
  }
};

const cancelEditName = () => {
  isEditingName.value = false;
  tempName.value = profileData.value.name;
  error.value = '';
};

const startEditingSurname = () => {
  isEditingSurname.value = true;
  tempSurname.value = profileData.value.surname;
};

const saveSurname = async () => {
  if (!tempSurname.value.trim()) {
    error.value = 'El apellido no puede estar vacío';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    success.value = '';

    await UserApi.updateProfile({
      name: profileData.value.name,
      surname: tempSurname.value.trim()
    });

    profileData.value.surname = tempSurname.value.trim();
    isEditingSurname.value = false;
    success.value = 'Apellido actualizado exitosamente';

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e: any) {
    console.error('Error updating surname:', e);
    error.value = e.message || 'Error al actualizar el apellido';
  } finally {
    loading.value = false;
  }
};

const cancelEditSurname = () => {
  isEditingSurname.value = false;
  tempSurname.value = profileData.value.surname;
  error.value = '';
};

const changePassword = async () => {
  const currentPassword = prompt('Contraseña actual:');
  if (!currentPassword) return;

  const newPassword = prompt('Nueva contraseña:');
  if (!newPassword) return;

  if (newPassword.length < 6) {
    alert('La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }

  const confirmPassword = prompt('Confirmar nueva contraseña:');
  if (!confirmPassword) return;

  if (newPassword !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    await UserApi.changePassword({
      currentPassword,
      newPassword
    });

    alert('Contraseña cambiada exitosamente');
    success.value = 'Contraseña cambiada exitosamente';

    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e: any) {
    console.error('Error changing password:', e);
    alert(e.message || 'Error al cambiar la contraseña. Verificá que la contraseña actual sea correcta.');
  } finally {
    loading.value = false;
  }
};

const initials = computed(() => {
  if (!profileData.value.name || !profileData.value.surname) return '';
  return `${profileData.value.name[0]}${profileData.value.surname[0]}`.toUpperCase();
});
</script>

<template>
  <div class="min-h-screen bg-[#FEFFF7] flex justify-center px-8 py-12">
    <div class="max-w-[500px] w-full flex flex-col gap-10">
      <!-- Loading State -->
      <div v-if="loading && !profileData.name" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-12 w-12 text-verde-sidebar" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <template v-else>
        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600 text-center">{{ error }}</p>
        </div>

        <!-- Success message -->
        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600 text-center">{{ success }}</p>
        </div>

        <!-- Avatar Section -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-[200px] h-[200px] rounded-full overflow-hidden shadow-lg">
            <div 
              v-if="profileData.avatar" 
              class="w-full h-full bg-cover bg-center"
              :style="{ backgroundImage: `url(${profileData.avatar})` }"
            ></div>
            <div v-else class="w-full h-full bg-gradient-to-br from-[#6B9BD1] to-[#4A7AB8] flex items-center justify-center">
              <span v-if="initials" class="text-6xl font-bold text-white">{{ initials }}</span>
              <svg v-else class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <button 
            @click="triggerFileInput" 
            class="text-verde-sidebar text-lg font-semibold px-4 py-2 hover:opacity-70 transition-opacity"
          >
            Cambiar foto de perfil
          </button>
          <input 
            id="avatar-input" 
            type="file" 
            accept="image/*" 
            @change="handleFileChange" 
            class="hidden"
          />
        </div>

      <!-- Name Section -->
      <div class="flex flex-col gap-2">
        <label class="text-2xl font-bold text-gray-900">Nombre</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div v-if="!isEditingName" class="flex items-center justify-between">
            <span class="text-lg text-gray-500">{{ profileData.name }}</span>
            <button 
              @click="startEditingName" 
              class="text-verde-sidebar p-1 hover:opacity-70 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div v-else class="flex flex-col gap-4">
            <input 
              v-model="tempName" 
              type="text" 
              class="w-full px-2 py-2 text-lg border-2 border-verde-sidebar rounded-md outline-none"
              @keyup.enter="saveName"
              @keyup.esc="cancelEditName"
            />
            <div class="flex gap-3 justify-end">
              <button 
                @click="saveName" 
                class="px-5 py-2 bg-verde-sidebar text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
                Guardar
              </button>
              <button 
                @click="cancelEditName" 
                class="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Surname Section -->
      <div class="flex flex-col gap-2">
        <label class="text-2xl font-bold text-gray-900">Apellido</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div v-if="!isEditingSurname" class="flex items-center justify-between">
            <span class="text-lg text-gray-500">{{ profileData.surname }}</span>
            <button 
              @click="startEditingSurname" 
              class="text-verde-sidebar p-1 hover:opacity-70 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div v-else class="flex flex-col gap-4">
            <input 
              v-model="tempSurname" 
              type="text" 
              class="w-full px-2 py-2 text-lg border-2 border-verde-sidebar rounded-md outline-none"
              @keyup.enter="saveSurname"
              @keyup.esc="cancelEditSurname"
            />
            <div class="flex gap-3 justify-end">
              <button 
                @click="saveSurname" 
                class="px-5 py-2 bg-verde-sidebar text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
                Guardar
              </button>
              <button 
                @click="cancelEditSurname" 
                class="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Section -->
      <div class="flex flex-col gap-2">
        <label class="text-2xl font-bold text-gray-900">Mail</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <span class="text-lg text-gray-500">{{ profileData.email }}</span>
        </div>
      </div>

      <!-- Change Password Button -->
      <div class="flex justify-center">
        <button 
          @click="changePassword" 
          class="bg-verde-sidebar text-white text-lg font-semibold px-8 py-3 rounded-xl flex items-center shadow-lg hover:bg-verde-contraste hover:-translate-y-0.5 transition-all"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Cambiar contraseña
        </button>
      </div>

      </template>
    </div>
  </div>
</template>
