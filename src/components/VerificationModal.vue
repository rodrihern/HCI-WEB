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
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h2
                            class="text-2xl font-bold text-gray-900 mb-2"
                        >
                            {{
                                title ||
                                "Verificar Email"
                            }}
                        </h2>
                        <p
                            class="text-gray-600"
                        >
                            <template
                                v-if="
                                    message
                                "
                            >
                                {{
                                    message
                                }}
                                <br />
                                <span
                                    class="font-semibold"
                                    >{{
                                        email
                                    }}</span
                                >
                            </template>
                            <template
                                v-else
                            >
                                Ingresá
                                el
                                código
                                de
                                verificación
                                que
                                enviamos
                                a <br />
                                <span
                                    class="font-semibold"
                                    >{{
                                        email
                                    }}</span
                                >
                            </template>
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
                    <div class="mb-6">
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
                                verify
                            "
                        />
                    </div>

                    <!-- Actions -->
                    <div
                        class="space-y-3"
                    >
                        <button
                            @click="
                                verify
                            "
                            :disabled="
                                !isCodeValid ||
                                loading
                            "
                            class="w-full bg-verde-sidebar hover:cursor-pointer hover:bg-verde-contraste text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span
                                v-if="
                                    !loading
                                "
                                >Verificar
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
                                Verificando...
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
    title?: string;
    message?: string;
}

interface Emits {
    (e: "close"): void;
    (e: "verify", code: string): void;
    (e: "resend"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const code = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");
const resendDisabled = ref(false);
const resendCountdown = ref(60);
let countdownInterval: number | null =
    null;

const isCodeValid = computed(() => {
    return code.value.trim().length > 0;
});

const verify = async () => {
    if (
        !isCodeValid.value ||
        loading.value
    )
        return;

    error.value = "";
    success.value = "";
    loading.value = true;

    try {
        emit("verify", code.value);
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
