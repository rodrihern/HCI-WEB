<script setup lang="ts">
defineProps<{
    title: string;
    onAddClick?: () => void;
    showAddButton?: boolean;
}>();
</script>

<template>
    <div
        class="flex items-center justify-between mb-6"
    >
        <h1
            class="text-3xl font-semibold text-gray-800"
        >
            {{ title }}
        </h1>

        <!-- Botón de agregar o spacer para mantener altura consistente -->
        <button
            v-if="
                showAddButton !==
                    false && onAddClick
            "
            @click="onAddClick"
            class="bg-gradient-to-br hover:cursor-pointer from-[#68AE6F] to-[#5a9860] hover:from-[#5a9860] hover:to-[#4d8251] text-white rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 shadow-xl hover:cursor-pointer hover:shadow-2xl hover:scale-110"
        >
            <span
                class="material-icons text-white text-4xl"
                >add</span
            >
        </button>
        <!-- Spacer invisible para mantener la altura cuando no hay botón -->
        <div
            v-else
            class="w-14 h-14"
        ></div>
    </div>
</template>
