<script setup lang="ts">
import {
    onMounted,
    onBeforeUnmount,
    ref,
    computed,
} from "vue";
import { useListsStore } from "../stores/lists";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import PreviewHistorialModal from "../components/PreviewHistorialModal.vue";
import ContextMenu from "../components/ContextMenu.vue";
import ListItem from "../components/ListItem.vue";

const store = useListsStore();

const openMenuForItemId = ref<
    number | null
>(null);
const showDeleteConfirm = ref(false);
const itemToDelete = ref<number | null>(
    null,
);

const toggleMenu = (
    e: Event,
    id: number,
) => {
    e.stopPropagation();
    openMenuForItemId.value =
        openMenuForItemId.value === id
            ? null
            : id;
};

const closeMenu = () => {
    openMenuForItemId.value = null;
};

const onKeydown = (
    e: KeyboardEvent,
) => {
    if (e.key === "Escape") closeMenu();
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
});

const openPreviewHistorial = (
    id: number,
) => {
    store.openPreviewHistorialModal(id);
};

const onRestore = (id: number) => {
    // Implementar lógica de restaurar
    alert("Restaurar " + id);
    closeMenu();
};

const confirmDelete = (id: number) => {
    itemToDelete.value = id;
    showDeleteConfirm.value = true;
    closeMenu();
};

const onDelete = () => {
    if (itemToDelete.value) {
        // Implementar lógica de eliminación en el store
        alert(
            "Eliminar " +
                itemToDelete.value,
        );
    }
    showDeleteConfirm.value = false;
    itemToDelete.value = null;
};

const formatDate = (
    dateString: string,
) => {
    return new Date(
        dateString,
    ).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getItemClass = (
    itemId: number,
) => {
    const baseClasses =
        "cursor-pointer hover:scale-[1.02] transition-transform";
    const activeClasses =
        openMenuForItemId.value ===
        itemId
            ? " relative z-50"
            : "";
    return baseClasses + activeClasses;
};
</script>

<template>
    <div class="py-6 px-6">
        <div
            class="flex items-center justify-between mb-6"
        >
            <div
                class="flex items-center gap-4"
            >
                <h1
                    class="text-xl font-semibold text-gray-800"
                >
                    Mis compras
                </h1>
            </div>
        </div>

        <div class="space-y-3">
            <ListItem
                v-for="item in store.history"
                :key="item.id"
                :title="item.list.name"
                :subtitle="`${formatDate(item.list.lastPurchasedAt)} • ${item.listItemArray.length} productos`"
                :class="
                    getItemClass(
                        item.id,
                    )
                "
                @click="
                    openPreviewHistorial(
                        item.id,
                    )
                "
            >
                <template #actions>
                    <button
                        class="text-white hover:text-gray-200 transition-colors p-2"
                        @click="
                            toggleMenu(
                                $event,
                                item.id,
                            )
                        "
                        aria-haspopup="menu"
                        :aria-expanded="
                            openMenuForItemId ===
                            item.id
                        "
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                        >
                            <use
                                href="@/assets/sprite.svg#three-dots"
                            />
                        </svg>
                    </button>

                    <ContextMenu
                        :show="
                            openMenuForItemId ===
                            item.id
                        "
                        :items="[
                            {
                                label: 'Restaurar',
                                onClick:
                                    () =>
                                        onRestore(
                                            item.id,
                                        ),
                            },
                            {
                                label: 'Eliminar',
                                onClick:
                                    () =>
                                        confirmDelete(
                                            item.id,
                                        ),
                                variant:
                                    'danger',
                            },
                        ]"
                    />
                </template>
            </ListItem>
        </div>

        <div
            v-if="
                store.history.length ===
                0
            "
            class="text-center text-gray-500 mt-12"
        >
            <p class="text-lg">
                No tienes historial
                todavía
            </p>
            <p class="text-sm">
                Tus compras aparecerán
                aquí
            </p>
        </div>

        <!-- Modal para vista previa de historial -->
        <PreviewHistorialModal
            @close="
                store.closePreviewHistorialModal
            "
        />

        <ConfirmationModal
            :show="showDeleteConfirm"
            title="Eliminar compra del historial"
            message="¿Estás seguro de que quieres eliminar esta compra del historial?"
            variant="danger"
            @confirm="onDelete"
            @cancel="
                showDeleteConfirm = false
            "
        >
            <template #details>
                <p
                    class="text-sm text-gray-600 mt-2"
                >
                    Esta acción no se
                    puede deshacer.
                </p>
            </template>
        </ConfirmationModal>
    </div>
</template>
