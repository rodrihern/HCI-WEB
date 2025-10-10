<script setup lang="ts">
export interface ContextMenuItem {
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
}

interface Props {
    /** Si el menú está visible */
    show: boolean;
    /** Opciones del menú */
    items: ContextMenuItem[];
}

defineProps<Props>();

const handleItemClick = (
    item: ContextMenuItem,
) => {
    item.onClick();
};
</script>

<template>
    <div
        v-if="show"
        class="absolute right-2 top-12 z-50 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200"
        role="menu"
        @click.stop
    >
        <button
            v-for="(
                item, index
            ) in items"
            :key="index"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
            :class="{
                'rounded-t-xl':
                    index === 0,
                'rounded-b-xl':
                    index ===
                    items.length - 1,
                'hover:bg-red-50 text-red-600':
                    item.variant ===
                    'danger',
            }"
            role="menuitem"
            @click="
                handleItemClick(item)
            "
        >
            {{ item.label }}
        </button>
    </div>
</template>
