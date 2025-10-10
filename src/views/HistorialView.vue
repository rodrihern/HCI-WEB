<script setup lang="ts">
import { ref } from "vue";
import { useListsStore } from "../stores/lists";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import PreviewHistorialModal from "../components/PreviewHistorialModal.vue";
import ContextMenu from "../components/ContextMenu.vue";
import ListItem from "../components/ListItem.vue";

const store = useListsStore();

const showDeleteConfirm = ref(false);
const itemToDelete = ref<number | null>(
    null,
);

const openMenuForItemId = ref<
    number | null
>(null);

const handleMenuStateChange = (
    itemId: number,
    isOpen: boolean,
) => {
    openMenuForItemId.value = isOpen
        ? itemId
        : null;
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

const openPreviewHistorial = (
    id: number,
) => {
    store.openPreviewHistorialModal(id);
};

const onRestore = (id: number) => {
    // Implementar lógica de restaurar
    alert("Restaurar " + id);
};

const confirmDelete = (id: number) => {
    itemToDelete.value = id;
    showDeleteConfirm.value = true;
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
                    <ContextMenu
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
                        @menu-state-change="
                            (isOpen) =>
                                handleMenuStateChange(
                                    item.id,
                                    isOpen,
                                )
                        "
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
