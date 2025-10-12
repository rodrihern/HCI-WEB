<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useListsStore } from "../stores/lists";
import { usePurchaseStore } from "../stores/purchase";
import PageHeader from "@/components/PageHeader.vue";
import PreviewHistorialModal from "../components/PreviewHistorialModal.vue";
import ListItem from "../components/ListItem.vue";
import SearchEmptyState from "@/components/SearchEmptyState.vue";
import { useSearchFilter } from "@/composables/search";
import { useNotifications } from "@/composables/notifications";

const store = useListsStore();
const purchaseStore = usePurchaseStore();
const {
    success: notifySuccess,
    error: notifyError,
} = useNotifications();

const isLoadingPurchases = ref(true);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );
};

onMounted(async () => {
    await loadPurchases();
});

const loadPurchases = async () => {
    isLoadingPurchases.value = true;
    try {
        await purchaseStore.getAll(undefined, {
            orderBy: "createdAt",
            order: "DESC",
            limit: 100,
        });
    } catch (error) {
        console.error(
            "Error loading purchases:",
            error,
        );
    } finally {
        isLoadingPurchases.value = false;
    }
};

const {
    filteredItems: filteredPurchases,
    isSearching,
} = useSearchFilter(
    computed(() => purchaseStore.purchases),
    (purchase, query) => {
        const listName =
            purchase.list?.name?.toLowerCase() ||
            "";
        const formattedDate = purchase.createdAt
            ? formatDate(purchase.createdAt).toLowerCase()
            : "";

        return (
            listName.includes(query) ||
            formattedDate.includes(query)
        );
    },
);

const getItemClass = (itemId: number) => {
    const baseClasses =
        "cursor-pointer hover:scale-[1.02] transition-transform";
    return baseClasses;
};

const openPreviewHistorial = (id: number) => {
    store.openPreviewHistorialModal(id);
};

const onRestore = async (id: number) => {
    try {
        await purchaseStore.restore(id);
        notifySuccess("Compra restaurada exitosamente");
    } catch (error) {
        console.error(
            "Error restoring purchase:",
            error,
        );
        notifyError(
            "No se pudo restaurar la compra. Intenta de nuevo.",
        );
    }
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
                v-for="
                    item in filteredPurchases
                "
                :key="item.id"
                :title="item.list.name"
                :subtitle="`${formatDate(item.createdAt || '')}`"
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
                    <button
                        @click.stop="onRestore(item.id!)"
                        class="text-white hover:bg-verde-contraste/60 rounded-lg transition-colors p-2 cursor-pointer flex items-center justify-center"
                        title="Restaurar compra"
                    >
                        <span class="material-icons text-xl">
                            repeat
                        </span>
                    </button>
                </template>
            </ListItem>
        </div>

        <SearchEmptyState
            :show="filteredPurchases.length === 0"
            :is-searching="isSearching"
            empty-title="No tienes historial todavía"
            empty-subtitle="Tus compras aparecerán aquí"
        />

        <!-- Modal para vista previa de historial -->
        <PreviewHistorialModal
            @close="
                store.closePreviewHistorialModal
            "
        />
    </div>
</template>
