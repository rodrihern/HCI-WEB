<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
    useNotificationStore,
    type NotificationType,
} from "@/stores/notifications";

const store = useNotificationStore();
const { notifications } = storeToRefs(store);

const typeStyles = computed<
    Record<
        NotificationType,
        {
            accent: string;
            iconColor: string;
            iconPath: string;
        }
    >
>(() => ({
    success: {
        accent: "border-verde-sidebar",
        iconColor: "text-verde-sidebar",
        iconPath: "M5 13l4 4L19 7",
    },
    error: {
        accent: "border-red-500",
        iconColor: "text-red-500",
        iconPath:
            "M6 18L18 6M6 6l12 12",
    },
    info: {
        accent: "border-sky-500",
        iconColor: "text-sky-500",
        iconPath:
            "M13 16h-1v-4h-1m1-4h.01",
    },
    warning: {
        accent: "border-amber-400",
        iconColor: "text-amber-500",
        iconPath:
            "M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z",
    },
}));

const configFor = (
    type: NotificationType,
) => {
    return (
        typeStyles.value[type] ||
        typeStyles.value.info
    );
};

const close = (id: number) => {
    store.remove(id);
};
</script>

<template>
    <div
        class="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none"
    >
        <transition-group
            name="notification"
            tag="div"
        >
            <div
                v-for="item in notifications"
                :key="item.id"
                class="pointer-events-auto w-80 max-w-[calc(100vw-3rem)] rounded-xl shadow-xl border border-gray-200 bg-white overflow-hidden"
                :class="`border-l-4 ${configFor(item.type).accent}`"
            >
                <div
                    class="flex gap-3 p-4 items-start"
                >
                    <div
                        class="flex-shrink-0 mt-0.5"
                    >
                        <span
                            class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
                            :class="configFor(item.type).iconColor"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    :d="configFor(item.type).iconPath"
                                />
                            </svg>
                        </span>
                    </div>
                    <div class="flex-1">
                        <p
                            v-if="item.title"
                            class="text-sm font-semibold text-gray-900"
                        >
                            {{ item.title }}
                        </p>
                        <p
                            class="text-sm text-gray-600"
                        >
                            {{ item.message }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        @click="close(item.id)"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.notification-enter-from,
.notification-leave-to {
    opacity: 0;
    transform: translateY(16px);
}

.notification-enter-active,
.notification-leave-active {
    transition: all 0.2s ease;
}

.notification-move {
    transition: transform 0.2s ease;
}
</style>
