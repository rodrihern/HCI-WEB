<script setup lang="ts">
import {
    onMounted,
    onBeforeUnmount,
} from "vue";

interface Props {
    show: boolean;
    title?: string;
    maxWidth?:
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "3xl"
        | "4xl"
        | "5xl"
        | "6xl";
    height?: string;
    closeOnClickOutside?: boolean;
}

const props = withDefaults(
    defineProps<Props>(),
    {
        maxWidth: "6xl",
        height: "85vh",
        closeOnClickOutside: false,
    },
);

const emit = defineEmits<{
    close: [];
}>();

const closeModal = () => {
    emit("close");
};

const handleBackdropClick = () => {
    if (props.closeOnClickOutside) {
        closeModal();
    }
};

const onKeydown = (
    e: KeyboardEvent,
) => {
    if (e.key === "Escape")
        closeModal();
};

onMounted(() => {
    window.addEventListener(
        "keydown",
        onKeydown,
    );
});

onBeforeUnmount(() => {
    window.removeEventListener(
        "keydown",
        onKeydown,
    );
});

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
};
</script>

<template>
    <transition name="modal-fade">
        <div
            v-if="show"
            class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            @click.self="
                handleBackdropClick
            "
        >
            <div
                :class="[
                    maxWidthClasses[
                        maxWidth
                    ],
                    'w-full overflow-hidden flex flex-col my-auto',
                ]"
                :style="{
                    maxHeight: height,
                }"
                class="bg-white rounded-3xl shadow-2xl"
            >
                <!-- Header del Modal -->
                <div
                    class="bg-fondo px-8 py-5 flex items-center justify-center border-b border-gray-200 relative flex-shrink-0"
                >
                    <button
                        @click="
                            closeModal
                        "
                        class="absolute left-8 text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <h2
                        class="text-2xl font-bold text-gray-800"
                    >
                        <slot
                            name="title"
                            >{{
                                title
                            }}</slot
                        >
                    </h2>
                </div>

                <!-- Contenido del Modal - Completamente personalizable con slots -->
                <div
                    class="flex-1 overflow-y-auto"
                >
                    <slot />
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.02 ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>
