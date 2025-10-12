<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useListsStore } from "../stores/lists";
import { usePurchaseStore } from "../stores/purchase";
import { usePurchase } from "../composables/purchase";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import PreviewHistorialModal from "../components/PreviewHistorialModal.vue";
import ContextMenu from "../components/ContextMenu.vue";
import ListItem from "../components/ListItem.vue";

const store = useListsStore();
const purchaseStore = usePurchaseStore();
const { getAllPurchases, restorePurchase } = usePurchase();

const showDeleteConfirm = ref(false);
const itemToDelete = ref<number | null>(null);
const openMenuForItemId = ref<number | null>(null);
const isLoadingPurchases = ref(false);

onMounted(async () => {
    await loadPurchases();
});

const loadPurchases = async () => {
    isLoadingPurchases.value = true;
    try {
        await getAllPurchases({ 
            orderBy: "createdAt", 
            order: "DESC",
            limit: 100 
        });
    } catch (error) {
        console.error("Error loading purchases:", error);
    } finally {
        isLoadingPurchases.value = false;
    }
};

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

const onRestore = async (id: number) => {
    try {
        await restorePurchase(id);
        alert(`Lista restaurada exitosamente`);
        await loadPurchases();
    } catch (error) {
        console.error("Error restoring purchase:", error);
        alert("Error al restaurar la lista");
    }
};

const confirmDelete = (id: number) => {
    itemToDelete.value = id;
    showDeleteConfirm.value = true;
};

const onDelete = () => {
    if (itemToDelete.value) {
        // Note: La API no tiene endpoint para eliminar compras del historial
        // Por ahora solo mostramos un mensaje
        alert(
            "Las compras del historial no se pueden eliminar"
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
                v-for="item in purchaseStore.purchases"
                :key="item.id"
                :title="item.list.name"
                :subtitle="`${formatDate(item.createdAt || '')} • ${item.listItemArray.length} productos`"
                :class="
                    getItemClass(
                        item.id!,
                    )
                "
                @click="
                    openPreviewHistorial(
                        item.id!,
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
                                            item.id!,
                                        ),
                            },
                            {
                                label: 'Eliminar',
                                onClick:
                                    () =>
                                        confirmDelete(
                                            item.id!,
                                        ),
                                variant:
                                    'danger',
                            },
                        ]"
                        @menu-state-change="
                            (isOpen) =>
                                handleMenuStateChange(
                                    item.id!,
                                    isOpen,
                                )
                        "
                    />
                </template>
            </ListItem>
        </div>

        <div
            v-if="
                purchaseStore.purchases.length === 0 && !isLoadingPurchases
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

        <div
            v-if="isLoadingPurchases"
            class="text-center text-gray-500 mt-12"
        >
            <p class="text-lg">
                Cargando historial...
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
