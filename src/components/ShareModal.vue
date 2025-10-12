<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { usePantry } from '@/composables/pantry'
import { useShoppingList } from '@/composables/shoppingList'

const props = defineProps<{
  show: boolean
  type: 'pantry' | 'list'
  itemId?: number
  itemName?: string
}>()

const emit = defineEmits<{
  close: []
  shared: []
}>()

const { sharePantry, getSharedUsers: getPantrySharedUsers, revokeShare: revokePantryShare } = usePantry()
const { shareShoppingList, getSharedUsers: getListSharedUsers, revokeShare: revokeListShare } = useShoppingList()

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const sharedUsers = ref<any[]>([])
const loadingUsers = ref(false)

// Computed properties for dynamic text
const itemTypeLabel = computed(() => props.type === 'pantry' ? 'Despensa' : 'Lista')
const itemTypeLower = computed(() => props.type === 'pantry' ? 'despensa' : 'lista')

const closeModal = () => {
  email.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  emit('close')
}

// Load shared users when modal opens
watch(() => [props.show, props.itemId], async ([show, itemId]) => {
  if (show && itemId && typeof itemId === 'number') {
    loadingUsers.value = true
    if (props.type === 'pantry') {
      const users = await getPantrySharedUsers(itemId)
      sharedUsers.value = users || []
    } else {
      const users = await getListSharedUsers(itemId)
      sharedUsers.value = users || []
    }
    loadingUsers.value = false
  }
}, { immediate: true })

const handleShare = async () => {
  if (!email.value.trim() || !props.itemId) return
  
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Por favor ingresa un email válido'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    let success = false
    if (props.type === 'pantry') {
      success = await sharePantry(props.itemId, email.value)
    } else {
      success = await shareShoppingList(props.itemId, email.value)
    }
    
    if (success) {
      successMessage.value = `${itemTypeLabel.value} compartida con ${email.value}`
      email.value = ''
      // Reload shared users
      if (props.type === 'pantry') {
        const users = await getPantrySharedUsers(props.itemId)
        sharedUsers.value = users || []
      } else {
        const users = await getListSharedUsers(props.itemId)
        sharedUsers.value = users || []
      }
      emit('shared')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = `No se pudo compartir la ${itemTypeLower.value}. Intenta nuevamente.`
    }
  } catch (error: any) {
    errorMessage.value = error.message || `Error al compartir la ${itemTypeLower.value}`
  } finally {
    isLoading.value = false
  }
}

const handleRevokeShare = async (userId: number) => {
  if (!props.itemId) return
  
  const confirmed = confirm('¿Estás seguro de que quieres revocar el acceso a este usuario?')
  if (!confirmed) return

  try {
    let success = false
    if (props.type === 'pantry') {
      success = await revokePantryShare(props.itemId, userId)
    } else {
      success = await revokeListShare(props.itemId, userId)
    }
    
    if (success) {
      // Reload shared users
      if (props.type === 'pantry') {
        const users = await getPantrySharedUsers(props.itemId)
        sharedUsers.value = users || []
      } else {
        const users = await getListSharedUsers(props.itemId)
        sharedUsers.value = users || []
      }
    }
  } catch (error: any) {
    errorMessage.value = 'Error al revocar acceso'
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="`Compartir: ${itemName || itemTypeLabel}`"
    max-width="xl"
    height="auto"
    @close="closeModal"
  >
    <div class="p-6 space-y-5">
      <!-- Form to add new user -->
      <div>
        <label class="block text-base font-semibold text-gray-700 mb-3">
          Email del usuario
        </label>
        <div class="flex flex-col sm:flex-row gap-3">
          <input 
            v-model="email"
            type="email" 
            placeholder="ejemplo@email.com"
            class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors"
            @keyup.enter="handleShare"
            :disabled="isLoading"
          />
          <button 
            @click="handleShare"
            :disabled="isLoading || !email.trim()"
            class="px-5 py-3 bg-verde-sidebar text-white font-semibold rounded-xl hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <svg v-else class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="hidden sm:inline">{{ isLoading ? 'Compartiendo...' : 'Compartir' }}</span>
            <span class="sm:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </button>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-600 text-sm">{{ successMessage }}</p>
        </div>
      </div>

      <!-- List of shared users -->
      <div>
        <h4 class="text-base font-semibold text-gray-700 mb-3">
          Usuarios con acceso
        </h4>

        <div v-if="loadingUsers" class="text-center py-6">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-verde-sidebar"></div>
          <p class="text-gray-500 mt-2 text-sm">Cargando usuarios...</p>
        </div>

        <div v-else-if="sharedUsers.length === 0" class="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-600 font-medium">No hay usuarios compartidos</p>
          <p class="text-sm text-gray-400 mt-1">Ingresa un email arriba para compartir</p>
        </div>

        <div v-else class="space-y-2 max-h-[200px] overflow-y-auto">
          <div 
            v-for="user in sharedUsers"
            :key="user.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 bg-verde-sidebar text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {{ user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-800 text-sm truncate">{{ user.name }} {{ user.surname }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>
            </div>
            <button 
              @click="handleRevokeShare(user.id)"
              class="text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors flex-shrink-0 ml-2"
              title="Revocar acceso"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Close button -->
      <div class="flex justify-end pt-3 border-t border-gray-200">
        <button 
          @click="closeModal"
          class="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
