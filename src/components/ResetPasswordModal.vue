<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="show"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm overflow-y-auto"
                @click.self="close"
            >
                <div
                    class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 my-auto"
                >
                    <div
                        class="text-center mb-6"
                    >
                        <div
                            class="mx-auto w-16 h-16 bg-verde-sidebar bg-opacity-10 rounded-full flex items-center justify-center mb-4"
                        >
                            <svg
                                class="w-8 h-8 text-verde-sidebar"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                        <h2
                            class="text-2xl font-bold text-gray-900 mb-2"
                        >
                            Recuperar
                            Contraseña
                        </h2>
                        <p
                            class="text-gray-600"
                        >
                            Ingresá el
                            código que
                            enviamos a
                            <br />
                            <span
                                class="font-semibold"
                                >{{
                                    email
                                }}</span
                            >
                            <br />
                            y tu nueva
                            contraseña
                        </p>
                    </div>

                    <!-- Error message -->
                    <div
                        v-if="error"
                        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <p
                            class="text-sm text-red-600 text-center"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Success message -->
                    <div
                        v-if="success"
                        class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                        <p
                            class="text-sm text-green-600 text-center"
                        >
                            {{
                                success
                            }}
                        </p>
                    </div>

                    <!-- Code input -->
                    <div class="mb-4">
                        <label
                            class="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Código de
                            Verificación
                        </label>
                        <input
                            v-model="
                                code
                            "
                            type="text"
                            placeholder="xxxxxxxxxxxx"
                            :disabled="
                                loading
                            "
                            class="w-full px-4 py-3 text-center text-lg font-mono tracking-wider border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            @keyup.enter="
                                resetPassword
                            "
                        />
                    </div>

                    <!-- New Password input -->
                    <div class="mb-4">
                        <label
                            class="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nueva
                            Contraseña
                        </label>
                        <div
                            class="relative"
                        >
                            <input
                                v-model="
                                    newPassword
                                "
                                :type="
                                    showNewPassword
                                        ? 'text'
                                        : 'password'
                                "
                                placeholder="Mínimo 8 caracteres"
                                minlength="8"
                                :disabled="
                                    loading
                                "
                                class="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                @keyup.enter="
                                    resetPassword
                                "
                            />
                            <button
                                type="button"
                                @click="
                                    showNewPassword =
                                        !showNewPassword
                                "
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:cursor-pointer hover:text-gray-600"
                                :disabled="
                                    loading
                                "
                            >
                                <svg
                                    v-if="
                                        !showNewPassword
                                    "
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Confirm Password input -->
                    <div class="mb-6">
                        <label
                            class="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Confirmar
                            Contraseña
                        </label>
                        <div
                            class="relative"
                        >
                            <input
                                v-model="
                                    confirmPassword
                                "
                                :type="
                                    showConfirmPassword
                                        ? 'text'
                                        : 'password'
                                "
                                placeholder="Repetí tu nueva contraseña"
                                minlength="8"
                                :disabled="
                                    loading
                                "
                                class="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                @keyup.enter="
                                    resetPassword
                                "
                            />
                            <button
                                type="button"
                                @click="
                                    showConfirmPassword =
                                        !showConfirmPassword
                                "
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:cursor-pointer hover:text-gray-600"
                                :disabled="
                                    loading
                                "
                            >
                                <svg
                                    v-if="
                                        !showConfirmPassword
                                    "
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div
                        class="space-y-3"
                    >
                        <button
                            @click="
                                resetPassword
                            "
                            :disabled="
                                !isFormValid ||
                                loading
                            "
                            class="w-full bg-verde-sidebar hover:cursor-pointer hover:bg-verde-contraste text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span
                                v-if="
                                    !loading
                                "
                                >Cambiar
                                Contraseña</span
                            >
                            <span
                                v-else
                                class="flex items-center justify-center"
                            >
                                <svg
                                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Cambiando...
                            </span>
                        </button>

                        <button
                            @click="
                                resendCode
                            "
                            :disabled="
                                loading ||
                                resendDisabled
                            "
                            class="w-full text-gray-700 hover:cursor-pointer hover:text-verde-sidebar font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span
                                v-if="
                                    !resendDisabled
                                "
                                >Reenviar
                                código</span
                            >
                            <span v-else
                                >Reenviar
                                en
                                {{
                                    resendCountdown
                                }}s</span
                            >
                        </button>

                        <button
                            @click="
                                close
                            "
                            :disabled="
                                loading
                            "
                            class="w-full text-gray-500 hover:cursor-pointer hover:text-gray-700 font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import {
    ref,
    computed,
    watch,
} from "vue";

interface Props {
    show: boolean;
    email: string;
}

interface Emits {
    (e: "close"): void;
    (
        e: "reset",
        data: {
            code: string;
            password: string;
        },
    ): void;
    (e: "resend"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const code = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref("");
const resendDisabled = ref(false);
const resendCountdown = ref(60);
let countdownInterval: number | null =
    null;

const isFormValid = computed(() => {
    return (
        code.value.trim().length > 0 &&
        newPassword.value.length >= 8 &&
        newPassword.value ===
            confirmPassword.value
    );
});

const resetPassword = async () => {
    if (
        !isFormValid.value ||
        loading.value
    )
        return;

    // Validate manually
    error.value = "";
    success.value = "";

    if (!code.value.trim()) {
        error.value =
            "El código de verificación es requerido";
        return;
    }

    if (!newPassword.value) {
        error.value =
            "La contraseña es requerida";
        return;
    }

    if (newPassword.value.length < 8) {
        error.value =
            "La contraseña debe tener al menos 8 caracteres";
        return;
    }

    if (
        newPassword.value !==
        confirmPassword.value
    ) {
        error.value =
            "Las contraseñas no coinciden";
        return;
    }

    loading.value = true;

    try {
        emit("reset", {
            code: code.value,
            password: newPassword.value,
        });
    } finally {
        loading.value = false;
    }
};

const resendCode = () => {
    if (
        resendDisabled.value ||
        loading.value
    )
        return;

    error.value = "";
    success.value =
        "Código reenviado! Revisá tu email.";
    emit("resend");

    // Start countdown
    resendDisabled.value = true;
    resendCountdown.value = 60;

    countdownInterval =
        window.setInterval(() => {
            resendCountdown.value--;
            if (
                resendCountdown.value <=
                0
            ) {
                resendDisabled.value = false;
                if (countdownInterval) {
                    clearInterval(
                        countdownInterval,
                    );
                    countdownInterval =
                        null;
                }
            }
        }, 1000);
};

const close = () => {
    if (loading.value) return;
    emit("close");
};

const setError = (message: string) => {
    error.value = message;
    success.value = "";
};

const setSuccess = (
    message: string,
) => {
    success.value = message;
    error.value = "";
};

// Reset state when modal opens/closes
watch(
    () => props.show,
    (newVal) => {
        if (newVal) {
            code.value = "";
            newPassword.value = "";
            confirmPassword.value = "";
            showNewPassword.value = false;
            showConfirmPassword.value = false;
            error.value = "";
            success.value = "";
            loading.value = false;
            resendDisabled.value = false;
            if (countdownInterval) {
                clearInterval(
                    countdownInterval,
                );
                countdownInterval =
                    null;
            }
        }
    },
);

// Expose methods for parent component
defineExpose({
    setError,
    setSuccess,
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
    transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
    transform: scale(0.9);
}
</style>
