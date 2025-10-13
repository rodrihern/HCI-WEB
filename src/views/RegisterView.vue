<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
    UserApi,
    Api,
    type RegisterData,
} from "@/api";
import VerificationModal from "@/components/VerificationModal.vue";
import { useNotifications } from "@/composables/notifications";

const router = useRouter();
const { error: notifyError, success: notifySuccess } = useNotifications();

// Form fields
const name = ref("");
const surname = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

// UI state
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showVerificationModal =
    ref(false);
const verificationModalRef =
    ref<InstanceType<
        typeof VerificationModal
    > | null>(null);

// Saved credentials for auto-login after verification
const savedEmail = ref("");
const savedPassword = ref("");

const goToLogin = () => {
    router.push("/login");
};

const validateForm = (): boolean => {
    if (!name.value.trim()) {
        notifyError("El nombre es requerido");
        return false;
    }

    if (!surname.value.trim()) {
        notifyError("El apellido es requerido");
        return false;
    }

    if (!email.value.trim()) {
        notifyError("El email es requerido");
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        notifyError("El email no es válido");
        return false;
    }

    if (!password.value.trim()) {
        notifyError("La contraseña es requerida");
        return false;
    }

    if (password.value.length < 8) {
        notifyError("La contraseña debe tener al menos 8 caracteres");
        return false;
    }

    if (!confirmPassword.value.trim()) {
        notifyError("Por favor confirma tu contraseña");
        return false;
    }

    if (
        password.value !==
        confirmPassword.value
    ) {
        notifyError("Las contraseñas no coinciden");
        return false;
    }

    return true;
};

const handleRegister = async () => {
    if (!validateForm()) return;

    loading.value = true;

    try {
        const registerData: RegisterData =
            {
                name: name.value.trim(),
                surname:
                    surname.value.trim(),
                email: email.value.trim(),
                password:
                    password.value,
                metadata: {},
            };

        await UserApi.register(
            registerData,
        );

        // Save credentials for auto-login after verification
        savedEmail.value =
            email.value.trim();
        savedPassword.value =
            password.value;

        // Show verification modal
        showVerificationModal.value = true;
    } catch (e: any) {
        console.error(
            "Register error:",
            e,
        );
        notifyError(
            e.message ||
            "Error al registrarse. Por favor, intentá de nuevo."
        );
    } finally {
        loading.value = false;
    }
};

const handleVerifyCode = async (
    code: string,
) => {
    try {
        await UserApi.verifyAccount({
            code,
        });

        verificationModalRef.value?.setSuccess(
            "Cuenta verificada exitosamente!",
        );

        // Wait a moment to show success message
        setTimeout(async () => {
            showVerificationModal.value = false;

            // Auto-login after verification
            await autoLogin();
        }, 1500);
    } catch (e: any) {
        console.error(
            "Verification error:",
            e,
        );
        verificationModalRef.value?.setError(
            e.message ||
                "Código inválido. Intentá de nuevo.",
        );
    }
};

const autoLogin = async () => {
    try {
        loading.value = true;

        const loginResponse =
            await UserApi.login({
                email: savedEmail.value,
                password:
                    savedPassword.value,
            });

        // Save token
        Api.token = loginResponse.token;
        localStorage.setItem(
            "security-token",
            loginResponse.token,
        );

        // Clear saved credentials
        savedEmail.value = "";
        savedPassword.value = "";

        // Redirect to main app
        router.push("/listas");
    } catch (e: any) {
        console.error(
            "Auto-login error:",
            e,
        );
        notifyError(
            "Cuenta verificada pero hubo un error al iniciar sesión. Por favor, iniciá sesión manualmente."
        );

        // Redirect to login after a moment
        setTimeout(() => {
            router.push("/login");
        }, 3000);
    } finally {
        loading.value = false;
    }
};

const handleResendCode = async () => {
    try {
        await UserApi.sendVerification(
            savedEmail.value ||
                email.value,
        );
        // Success message is shown by the modal component
    } catch (e: any) {
        console.error(
            "Resend code error:",
            e,
        );
        verificationModalRef.value?.setError(
            "Error al reenviar el código. Intentá de nuevo.",
        );
    }
};

const closeVerificationModal = () => {
    showVerificationModal.value = false;
    // Optionally redirect to login
    // router.push('/login');
};
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-fondo p-2 sm:p-4 lg:p-8"
    >
        <!-- Main container - one big box -->
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

                <!-- Logo image - Large size -->
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
                        No vuelvas a
                        olvidar nada.
                    </h2>
                </div>
            </div>

            <!-- Right side - Register form -->
            <div
                class="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-0"
            >
                <div
                    class="w-full max-w-md"
                >
                    <div
                        class="text-center mb-6 lg:mb-8"
                    >
                        <h1
                            class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2"
                        >
                            Crear Cuenta
                        </h1>
                    </div>

                    <div
                        class="space-y-3 sm:space-y-4"
                    >
                        <input
                            v-model="
                                name
                            "
                            type="text"
                            placeholder="Nombre"
                            :disabled="
                                loading
                            "
                            class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <input
                            v-model="
                                surname
                            "
                            type="text"
                            placeholder="Apellido"
                            :disabled="
                                loading
                            "
                            class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <input
                            v-model="
                                email
                            "
                            type="email"
                            placeholder="Email"
                            :disabled="
                                loading
                            "
                            class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <div
                            class="relative"
                        >
                            <input
                                v-model="
                                    password
                                "
                                :type="
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                "
                                placeholder="Contraseña"
                                minlength="8"
                                :disabled="
                                    loading
                                "
                                class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                @click="
                                    showPassword =
                                        !showPassword
                                "
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                :disabled="
                                    loading
                                "
                            >
                                <svg
                                    v-if="
                                        !showPassword
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
                                placeholder="Confirmar Contraseña"
                                minlength="8"
                                :disabled="
                                    loading
                                "
                                class="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-verde-sidebar focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                @click="
                                    showConfirmPassword =
                                        !showConfirmPassword
                                "
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                        <button
                            @click="
                                handleRegister
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
                                >Registrarse</span
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
                                Registrando...
                            </span>
                        </button>

                        <div
                            class="text-center text-sm pt-1"
                        >
                            <span
                                class="text-gray-700"
                                >¿Ya
                                tenés
                                una
                                cuenta?
                            </span>
                            <a
                                @click="
                                    goToLogin
                                "
                                class="font-bold text-gray-900 hover:text-verde-sidebar cursor-pointer"
                                >Iniciá
                                Sesión</a
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Verification Modal -->
        <VerificationModal
            ref="verificationModalRef"
            :show="
                showVerificationModal
            "
            :email="email"
            @close="
                closeVerificationModal
            "
            @verify="handleVerifyCode"
            @resend="handleResendCode"
        />
    </div>
</template>

<style scoped></style>
