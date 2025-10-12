<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserApi } from "@/api";
import ResetPasswordModal from "@/components/ResetPasswordModal.vue";

const router = useRouter();

// Form fields
const email = ref("");

// UI state
const loading = ref(false);
const error = ref("");
const showResetModal = ref(false);
const resetModalRef = ref<InstanceType<
    typeof ResetPasswordModal
> | null>(null);

const goToLogin = () => {
    router.push("/login");
};

const validateEmail = (): boolean => {
    error.value = "";

    if (!email.value.trim()) {
        error.value =
            "El email es requerido";
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        error.value =
            "El email no es válido";
        return false;
    }

    return true;
};

const handleRequestCode = async () => {
    if (!validateEmail()) return;

    loading.value = true;
    error.value = "";

    try {
        await UserApi.forgotPassword(
            email.value.trim(),
        );

        // Show reset password modal
        showResetModal.value = true;
    } catch (e: any) {
        console.error(
            "Forgot password error:",
            e,
        );
        error.value =
            e.message ||
            "Error al enviar el código. Verificá que el email esté registrado.";
    } finally {
        loading.value = false;
    }
};

const handleResetPassword =
    async (data: {
        code: string;
        password: string;
    }) => {
        try {
            await UserApi.resetPassword(
                {
                    code: data.code,
                    password:
                        data.password,
                },
            );

            resetModalRef.value?.setSuccess(
                "Contraseña cambiada exitosamente!",
            );

            // Wait a moment to show success message
            setTimeout(() => {
                showResetModal.value = false;
                router.push("/login");
            }, 1500);
        } catch (e: any) {
            console.error(
                "Reset password error:",
                e,
            );
            resetModalRef.value?.setError(
                e.message ||
                    "Código inválido o expirado. Intentá de nuevo.",
            );
        }
    };

const handleResendCode = async () => {
    try {
        await UserApi.forgotPassword(
            email.value.trim(),
        );
        // Success message is handled by VerificationModal
    } catch (e: any) {
        console.error(
            "Resend code error:",
            e,
        );
        resetModalRef.value?.setError(
            "Error al reenviar el código. Intentá de nuevo.",
        );
    }
};

const closeResetModal = () => {
    showResetModal.value = false;
};
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-fondo p-2 sm:p-4 lg:p-8"
    >
        <!-- Main container -->
        <div
            class="flex flex-col lg:flex-row w-full max-w-7xl h-auto lg:h-[85vh] max-h-[900px] bg-white rounded-3xl shadow-xl overflow-hidden"
        >
            <!-- Left side - Green rectangle with logo and illustration -->
            <div
                class="w-full lg:w-1/2 bg-verde-sidebar flex flex-col items-center justify-center py-6 px-4 min-h-[300px] lg:min-h-0"
            >
                <div
                    class="text-center mb-4"
                >
                    <svg
                        class="w-32 sm:w-48 lg:w-64 h-8 sm:h-12 lg:h-16 mx-auto"
                    >
                        <use
                            href="@/assets/sprite.svg#logo"
                        />
                    </svg>
                </div>

                <!-- Logo image -->
                <div
                    class="flex-1 flex items-center justify-center w-full mb-4"
                >
                    <img
                        src="@/assets/logo_login.svg"
                        alt="Listazo Logo"
                        class="w-48 sm:w-64 lg:w-80 xl:w-96 h-auto max-w-full object-contain"
                    />
                </div>

                <div
                    class="text-center pb-4"
                >
                    <h2
                        class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white px-4"
                    >
                        Recuperá tu
                        contraseña
                    </h2>
                </div>
            </div>

            <!-- Right side - Forgot password form -->
            <div
                class="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-0"
            >
                <div
                    class="w-full max-w-md"
                >
                    <div>
                        <div
                            class="text-center mb-6 lg:mb-8"
                        >
                            <h1
                                class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2"
                            >
                                ¿Olvidaste
                                tu
                                contraseña?
                            </h1>
                            <p
                                class="text-gray-600 mt-4"
                            >
                                Ingresá
                                tu email
                                y te
                                enviaremos
                                un
                                código
                                de
                                verificación
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
                                {{
                                    error
                                }}
                            </p>
                        </div>

                        <div
                            class="space-y-3 sm:space-y-4"
                        >
                            <input
                                v-model="
                                    email
                                "
                                type="email"
                                placeholder="Email"
                                :disabled="
                                    loading
                                "
                                @keyup.enter="
                                    handleRequestCode
                                "
                                class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />

                            <button
                                @click="
                                    handleRequestCode
                                "
                                :disabled="
                                    loading
                                "
                                class="w-full bg-verde-sidebar hover:bg-verde-contraste text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span
                                    v-if="
                                        !loading
                                    "
                                    >Enviar
                                    Código</span
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
                                    Enviando...
                                </span>
                            </button>

                            <div
                                class="text-center text-sm pt-1"
                            >
                                <span
                                    class="text-gray-700"
                                    >¿Ya
                                    tenés
                                    cuenta?
                                </span>
                                <a
                                    @click="
                                        goToLogin
                                    "
                                    class="font-bold text-gray-900 hover:text-verde-sidebar cursor-pointer"
                                >
                                    Iniciar
                                    Sesión
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reset Password Modal -->
        <ResetPasswordModal
            ref="resetModalRef"
            :show="showResetModal"
            :email="email"
            @reset="handleResetPassword"
            @resend="handleResendCode"
            @close="closeResetModal"
        />
    </div>
</template>

<style scoped></style>
