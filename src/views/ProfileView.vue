<script setup lang="ts">
import { ref } from 'vue'

const profileData = ref({
  name: 'John',
  surname: 'Doe',
  email: 'johndoe@email.com',
  password: '1234567890',
  metadata: {},
  avatar: null as string | null
})

const isEditingName = ref(false)
const isEditingSurname = ref(false)
const tempName = ref(profileData.value.name)
const tempSurname = ref(profileData.value.surname)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.avatar = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const triggerFileInput = () => {
  const fileInput = document.getElementById('avatar-input') as HTMLInputElement
  fileInput?.click()
}

const startEditingName = () => {
  isEditingName.value = true
  tempName.value = profileData.value.name
}

const saveName = () => {
  if (tempName.value.trim()) {
    profileData.value.name = tempName.value.trim()
    isEditingName.value = false
  }
}

const cancelEditName = () => {
  isEditingName.value = false
  tempName.value = profileData.value.name
}

const startEditingSurname = () => {
  isEditingSurname.value = true
  tempSurname.value = profileData.value.surname
}

const saveSurname = () => {
  if (tempSurname.value.trim()) {
    profileData.value.surname = tempSurname.value.trim()
    isEditingSurname.value = false
  }
}

const cancelEditSurname = () => {
  isEditingSurname.value = false
  tempSurname.value = profileData.value.surname
}

const changePassword = () => {
  const currentPassword = prompt('Contraseña actual:')
  if (!currentPassword) return
  
  if (currentPassword !== profileData.value.password) {
    alert('Contraseña actual incorrecta')
    return
  }
  
  const newPassword = prompt('Nueva contraseña:')
  if (!newPassword) return
  
  const confirmPassword = prompt('Confirmar nueva contraseña:')
  if (!confirmPassword) return
  
  if (newPassword !== confirmPassword) {
    alert('Las contraseñas no coinciden')
    return
  }
  
  profileData.value.password = newPassword
  alert('Contraseña cambiada exitosamente')
}

</script>

<template>
  <div class="min-h-screen bg-[#FEFFF7] flex justify-center px-8 py-12">
    <div class="max-w-[500px] w-full flex flex-col gap-10">
      <!-- Avatar Section -->
      <div class="flex flex-col items-center gap-4">
        <div class="w-[200px] h-[200px] rounded-full overflow-hidden shadow-lg">
          <div 
            v-if="profileData.avatar" 
            class="w-full h-full bg-cover bg-center"
            :style="{ backgroundImage: `url(${profileData.avatar})` }"
          ></div>
          <div v-else class="w-full h-full bg-gradient-to-br from-[#6B9BD1] to-[#4A7AB8] flex items-center justify-center">
            <svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <button 
          @click="triggerFileInput" 
          class="text-verde-sidebar t-body font-semibold px-4 py-2 hover:opacity-70 transition-opacity"
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
        <label class="t-heading font-bold text-gray-900">Nombre</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div v-if="!isEditingName" class="flex items-center justify-between">
            <span class="t-body text-gray-500">{{ profileData.name }}</span>
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
              class="w-full px-2 py-2 border-2 border-verde-sidebar rounded-md outline-none"
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
        <label class="t-heading font-bold text-gray-900">Apellido</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div v-if="!isEditingSurname" class="flex items-center justify-between">
            <span class="t-body text-gray-500">{{ profileData.surname }}</span>
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
              class="w-full px-2 py-2 border-2 border-verde-sidebar rounded-md outline-none"
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
        <label class="t-heading font-bold text-gray-900">Mail</label>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <span class="t-body text-gray-500">{{ profileData.email }}</span>
        </div>
      </div>

      <!-- Change Password Button -->
      <div class="flex justify-center">
        <button 
          @click="changePassword" 
          class="bg-verde-sidebar text-white t-body font-semibold px-8 py-3 rounded-xl flex items-center shadow-lg hover:bg-verde-contraste hover:-translate-y-0.5 transition-all"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Cambiar contraseña
        </button>
      </div>

    </div>
  </div>
</template>
