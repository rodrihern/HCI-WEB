<script setup lang="ts">
import {
    ref,
    onMounted,
    onBeforeUnmount,
} from "vue";

export interface ContextMenuItem {
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
}

interface Props {
    /** Opciones del menú */
    items: ContextMenuItem[];
    /** Color del ícono de tres puntos */
    iconColor?: string;
}

const props = withDefaults(
    defineProps<Props>(),
    {
        iconColor: "text-white",
    },
);

const emit = defineEmits<{
    menuStateChange: [isOpen: boolean];
}>();

const showMenu = ref(false);
const CONTEXT_MENU_OPEN_EVENT =
    "context-menu-open";
const menuId = Symbol(
    "context-menu",
);

const openMenu = () => {
    if (showMenu.value) return;
    showMenu.value = true;
    emit("menuStateChange", true);
};

const toggleMenu = (event: Event) => {
    event.stopPropagation();
    if (showMenu.value) {
        closeMenu();
    } else {
        window.dispatchEvent(
            new CustomEvent(
                CONTEXT_MENU_OPEN_EVENT,
                {
                    detail: menuId,
                },
            ),
        );
        openMenu();
    }
};

const closeMenu = () => {
    if (!showMenu.value) return;
    showMenu.value = false;
    emit("menuStateChange", false);
};

const handleItemClick = (
    item: ContextMenuItem,
) => {
    item.onClick();
    closeMenu();
};

const onKeydown = (
    e: KeyboardEvent,
) => {
    if (e.key === "Escape") closeMenu();
};

const handleExternalMenuOpen = (
    event: Event,
) => {
    const customEvent =
        event as CustomEvent<symbol>;
    if (customEvent.detail !== menuId) {
        closeMenu();
    }
};

onMounted(() => {
    window.addEventListener(
        "click",
        closeMenu,
    );
    window.addEventListener(
        "keydown",
        onKeydown,
    );
    window.addEventListener(
        CONTEXT_MENU_OPEN_EVENT,
        handleExternalMenuOpen,
    );
});

onBeforeUnmount(() => {
    window.removeEventListener(
        "click",
        closeMenu,
    );
    window.removeEventListener(
        "keydown",
        onKeydown,
    );
    window.removeEventListener(
        CONTEXT_MENU_OPEN_EVENT,
        handleExternalMenuOpen,
    );
});
</script>

<template>
    <div
        :class="[
            'relative flex-shrink-0',
            { 'z-[100]': showMenu },
        ]"
    >
        <button
            :class="[
                iconColor,
                'hover:bg-verde-contraste/60 rounded-lg transition-colors p-2 hover:cursor-pointer flex items-center justify-center',
            ]"
            @click="toggleMenu"
            aria-haspopup="menu"
            :aria-expanded="showMenu"
            aria-label="Opciones"
        >
            <span class="material-icons text-xl">more_vert</span>
        </button>

        <div
            v-if="showMenu"
            class="absolute right-2 top-12 z-[100] w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200"
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
                        items.length -
                            1,
                    'hover:bg-red-50 text-red-600':
                        item.variant ===
                        'danger',
                }"
                role="menuitem"
                @click="
                    handleItemClick(
                        item,
                    )
                "
            >
                {{ item.label }}
            </button>
        </div>
    </div>
</template>
