<script setup lang="ts">
import { ref } from 'vue'

const profileData = ref({
  name: 'John Doe',
  email: 'johnDoe@gmail.com',
  avatar: null as string | null
})

const isEditingName = ref(false)
const tempName = ref(profileData.value.name)

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

const shareProfile = () => {
  alert('Funcionalidad de compartir perfil')
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-container">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <div v-if="profileData.avatar" class="avatar-image" :style="{ backgroundImage: `url(${profileData.avatar})` }"></div>
          <div v-else class="avatar-placeholder">
            <svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <button @click="triggerFileInput" class="change-photo-btn">
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
      <div class="info-section">
        <label class="info-label">Nombre</label>
        <div class="info-content">
          <div v-if="!isEditingName" class="info-display">
            <span class="info-text">{{ profileData.name }}</span>
            <button @click="startEditingName" class="edit-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div v-else class="edit-mode">
            <input 
              v-model="tempName" 
              type="text" 
              class="edit-input"
              @keyup.enter="saveName"
              @keyup.esc="cancelEditName"
            />
            <div class="edit-actions">
              <button @click="saveName" class="save-btn">Guardar</button>
              <button @click="cancelEditName" class="cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Section -->
      <div class="info-section">
        <label class="info-label">Mail</label>
        <div class="info-content">
          <span class="info-text">{{ profileData.email }}</span>
        </div>
      </div>

      <!-- Share Button -->
      <div class="share-section">
        <button @click="shareProfile" class="share-btn">
          <span>Compartir</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #FEFFF7;
  display: flex;
  justify-content: center;
  padding: 3rem 2rem;
}

.profile-container {
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-wrapper {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6B9BD1 0%, #4A7AB8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-photo-btn {
  color: #68AE6F;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.change-photo-btn:hover {
  opacity: 0.7;
}

.hidden {
  display: none;
}

/* Info Sections */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
}

.info-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-text {
  font-size: 1.125rem;
  color: #6b7280;
}

.edit-btn {
  color: #68AE6F;
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.edit-btn:hover {
  opacity: 0.7;
}

/* Edit Mode */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1.125rem;
  border: 2px solid #68AE6F;
  border-radius: 0.375rem;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.save-btn {
  background-color: #68AE6F;
  color: white;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.save-btn:hover,
.cancel-btn:hover {
  opacity: 0.8;
}

/* Share Section */
.share-section {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.share-btn {
  background-color: #68AE6F;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 3rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(104, 174, 111, 0.3);
  transition: all 0.2s;
}

.share-btn:hover {
  background-color: #5a9860;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(104, 174, 111, 0.4);
}
</style>
