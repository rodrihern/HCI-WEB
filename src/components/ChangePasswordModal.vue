<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { useNotifications } from '@/composables/notifications';

interface Props {
    show: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
});

const emit = defineEmits<{
    close: [];
    save: [data: { currentPassword: string; newPassword: string }];
}>();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const { error: notifyError } = useNotifications();

// Watch para resetear el formulario cuando se abre/cierra el modal
watch(() => props.show, (newVal) => {
    if (newVal) {
        resetForm();
    }
});

const resetForm = () => {
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
};

const closeModal = () => {
    resetForm();
    emit('close');
};

const handleSave = () => {
    // Validaciones
    if (!currentPassword.value.trim()) {
        notifyError('Por favor ingresa tu contraseña actual');
        return;
    }

    if (!newPassword.value.trim()) {
        notifyError('Por favor ingresa tu nueva contraseña');
        return;
    }

    if (newPassword.value.length < 6) {
        notifyError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (!confirmPassword.value.trim()) {
        notifyError('Por favor confirma tu nueva contraseña');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        notifyError('Las contraseñas no coinciden');
        return;
    }

    if (currentPassword.value === newPassword.value) {
        notifyError('La nueva contraseña debe ser diferente a la actual');
        return;
    }

    // Si todas las validaciones pasan, emitir evento
    emit('save', {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
    });
};

// Función para mostrar error desde el componente padre
const showError = (message: string) => {
    notifyError(message);
};

defineExpose({ showError });
</script>

<template>
    <BaseModal
        :show="show"
        title="Cambiar Contraseña"
        max-width="md"
        height="auto"
        @close="closeModal"
    >
        <div class="p-8 flex flex-col gap-6">
            <!-- Current Password -->
            <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700">
                    Contraseña Actual *
                </label>
                <div class="relative">
                    <input
                        v-model="currentPassword"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        placeholder="Ingresá tu contraseña actual"
                        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
                        :disabled="loading"
                        @keyup.enter="handleSave"
                    />
                    <button
                        type="button"
                        @click="showCurrentPassword = !showCurrentPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        :disabled="loading"
                    >
                        <svg v-if="!showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- New Password -->
            <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700">
                    Nueva Contraseña *
                </label>
                <div class="relative">
                    <input
                        v-model="newPassword"
                        :type="showNewPassword ? 'text' : 'password'"
                        placeholder="Ingresá tu nueva contraseña"
                        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
                        :disabled="loading"
                        @keyup.enter="handleSave"
                    />
                    <button
                        type="button"
                        @click="showNewPassword = !showNewPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        :disabled="loading"
                    >
                        <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
                <p class="text-xs text-gray-500">
                    La contraseña debe tener al menos 6 caracteres
                </p>
            </div>

            <!-- Confirm New Password -->
            <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-gray-700">
                    Confirmar Nueva Contraseña *
                </label>
                <div class="relative">
                    <input
                        v-model="confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="Confirmá tu nueva contraseña"
                        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent"
                        :disabled="loading"
                        @keyup.enter="handleSave"
                    />
                    <button
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        :disabled="loading"
                    >
                        <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 justify-end pt-4">
                <button
                    @click="closeModal"
                    class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    :disabled="loading"
                >
                    Cancelar
                </button>
                <button
                    @click="handleSave"
                    class="px-6 py-3 bg-verde-sidebar text-white font-semibold rounded-lg hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    :disabled="loading"
                >
                    <svg
                        v-if="loading"
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>{{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}</span>
                </button>
            </div>
        </div>
    </BaseModal>
</template>
