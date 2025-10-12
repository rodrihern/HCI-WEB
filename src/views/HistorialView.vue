<script setup lang="ts">
import {
    ref,
    onMounted,
    computed,
} from "vue";
import { useListsStore } from "../stores/lists";
import { usePurchaseStore } from "../stores/purchase";
import PageHeader from "@/components/PageHeader.vue";
import PreviewHistorialModal from "../components/PreviewHistorialModal.vue";
import ContextMenu from "../components/ContextMenu.vue";
import ListItem from "../components/ListItem.vue";

const store = useListsStore();
const purchaseStore =
    usePurchaseStore();

const openMenuForItemId = ref<
    number | null
>(null);
const isLoadingPurchases = ref(true);

onMounted(async () => {
    await loadPurchases();
});

const loadPurchases = async () => {
    isLoadingPurchases.value = true;
    try {
        await purchaseStore.getAll(
            undefined,
            {
                orderBy: "createdAt",
                order: "DESC",
                limit: 100,
            },
        );
    } catch (error) {
        console.error(
            "Error loading purchases:",
            error,
        );
    } finally {
        isLoadingPurchases.value = false;
    }
};

const purchases = computed(
    () => purchaseStore.purchases,
);

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

const onRestore = async (
    id: number,
) => {
    try {
        await purchaseStore.restore(id);

        // Eliminar la compra del store después de restaurarla
        purchaseStore.removePurchase(
            id,
        );

        // Cerrar el modal si está abierto
        if (
            store.previewingHistorialId ===
            id
        ) {
            store.closePreviewHistorialModal();
        }

        alert(
            `Lista restaurada exitosamente`,
        );
    } catch (error) {
        console.error(
            "Error restoring purchase:",
            error,
        );
        alert(
            "Error al restaurar la lista",
        );
    }
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

const formatDateTime = (
    dateString: string,
) => {
    return new Date(
        dateString,
    ).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getPurchasedCount = (
    item: any,
) => {
    return (
        item.listItemArray?.filter(
            (i: any) => i.purchased,
        ).length || 0
    );
};

const getTotalCount = (item: any) => {
    return (
        item.listItemArray?.length || 0
    );
};
</script>

<template>
    <div class="py-6 px-6">
        <PageHeader
            title="Mis compras"
            :show-add-button="false"
        />

        <div class="space-y-3">
            <ListItem
                v-for="item in purchases"
                :key="item.id"
                :title="`Compra de: ${item.list.name}`"
                :subtitle="`${formatDateTime(item.createdAt || '')} • ${getPurchasedCount(item)}/${getTotalCount(item)} productos comprados`"
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
                purchases.length ===
                    0 &&
                !isLoadingPurchases
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
    </div>
</template>
