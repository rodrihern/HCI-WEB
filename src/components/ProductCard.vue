<script setup lang="ts">
import { ref } from "vue";
import ContextMenu from "./ContextMenu.vue";

interface Props {
    icon: string;
    name: string;
    category: string;
    description?: string;
    image?: string;
    productId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    delete: [id: string];
    edit: [id: string];
    addToList: [id: string];
}>();

const isExpanded = ref(false);

const toggleExpanded = () => {
    // Toggle expandir/colapsar
    isExpanded.value =
        !isExpanded.value;
};

const contextMenuItems = [
    {
        label: "Añadir a lista",
        onClick: () => {
            emit(
                "addToList",
                props.productId,
            );
        },
    },
    {
        label: "Editar",
        onClick: () => {
            emit(
                "edit",
                props.productId,
            );
        },
    },
    {
        label: "Eliminar",
        onClick: () => {
            emit(
                "delete",
                props.productId,
            );
        },
        variant: "danger" as const,
    },
];
</script>

<template>
    <div
        class="bg-verde-claro rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
        :class="{
            'shadow-lg': isExpanded,
        }"
        @click="toggleExpanded"
    >
        <!-- Borde cuando está expandido -->
        <div
            v-if="isExpanded"
            class="absolute inset-0 rounded-xl border-3 border-verde-contraste pointer-events-none"
        ></div>

        <div class="relative">
            <!-- Contenido compacto -->
            <div
                class="p-4 flex items-start gap-4"
            >
                <!-- Imagen del producto (expandible) -->
                <div
                    class="flex-shrink-0 rounded-lg overflow-hidden bg-white/90 flex items-center justify-center transition-all duration-300"
                    :class="
                        isExpanded
                            ? 'w-32 h-32'
                            : 'w-16 h-16'
                    "
                >
                    <img
                        v-if="image"
                        :src="image"
                        :alt="name"
                        class="w-full h-full object-cover"
                    />
                    <span
                        v-else
                        :class="
                            isExpanded
                                ? 'text-6xl'
                                : 'text-3xl'
                        "
                        class="transition-all duration-300"
                        >{{
                            icon
                        }}</span
                    >
                </div>

                <!-- Nombre y categoría -->
                <div
                    class="flex-1 min-w-0 transition-transform duration-300"
                    :style="{
                        transform:
                            isExpanded
                                ? 'translateY(0)'
                                : 'translateY(20px)',
                    }"
                >
                    <h3
                        class="text-white font-semibold text-lg"
                    >
                        {{ name }}
                    </h3>
                    <p
                        v-if="
                            isExpanded
                        "
                        class="text-white/80 text-sm"
                    >
                        {{ category }}
                    </p>
                </div>

                <!-- Menú contextual -->
                <ContextMenu
                    :items="
                        contextMenuItems
                    "
                    icon-color="text-white"
                />
            </div>

            <!-- Contenido expandido (descripción) -->
            <div
                class="grid transition-all duration-300 ease-in-out overflow-hidden"
                :class="
                    isExpanded
                        ? 'grid-rows-[1fr]'
                        : 'grid-rows-[0fr]'
                "
            >
                <div class="min-h-0">
                    <div
                        class="border-t border-white/20 px-4 pb-4 pt-3"
                    >
                        <div
                            v-if="
                                description
                            "
                            class="bg-white/10 rounded-lg p-3"
                        >
                            <p
                                class="text-sm font-medium text-white/90 mb-1"
                            >
                                Descripción:
                            </p>
                            <p
                                class="text-white/80 text-sm leading-relaxed"
                            >
                                {{
                                    description
                                }}
                            </p>
                        </div>
                        <div
                            v-else
                            class="text-white/60 text-sm italic"
                        >
                            Sin
                            descripción
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
