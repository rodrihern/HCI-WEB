<script setup lang="ts">
import { ref } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import ListItem from "@/components/ListItem.vue";
import ContextMenu, { type ContextMenuItem } from "@/components/ContextMenu.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import CreatePantrySectionModal from "@/components/CreatePantrySectionModal.vue";
import PreviewPantryModal from "@/components/PreviewPantryModal.vue";
import SharePantryModal from "@/components/SharePantryModal.vue";
import AddProductsToPantryModal from "@/components/AddProductsToPantryModal.vue";
import { usePantry } from "@/composables/pantry";
import { useUser } from "@/composables/user";
import type { Pantry } from "@/api/pantry";

const { pantries, createPantry, deletePantry } = usePantry();
const { user } = useUser();

// Modal states
const showCreatePantryModal = ref(false);
const showPreviewPantryModal = ref(false);
const showSharePantryModal = ref(false);
const showDeleteConfirm = ref(false);
const showAddProductsModal = ref(false);

// Selected pantry for preview/share/delete/add products
const selectedPantryId = ref<number | undefined>(undefined);
const selectedPantryName = ref<string>("");
const pantryToDelete = ref<number | null>(null);

const openCreatePantryModal = () => {
    showCreatePantryModal.value = true;
};

const handleCreatePantry = async (name: string) => {
    await createPantry(name, {});
    showCreatePantryModal.value = false;
};

const openPreviewPantry = (pantryId: number, pantryName: string) => {
    selectedPantryId.value = pantryId;
    selectedPantryName.value = pantryName;
    showPreviewPantryModal.value = true;
};

const closePreviewPantry = () => {
    showPreviewPantryModal.value = false;
    selectedPantryId.value = undefined;
    selectedPantryName.value = "";
};

const openShareModal = (pantryId: number, pantryName: string) => {
    selectedPantryId.value = pantryId;
    selectedPantryName.value = pantryName;
    showSharePantryModal.value = true;
};

const handleShareFromPreview = (pantryId: number) => {
    const pantry = pantries.value.find(p => p.id === pantryId);
    if (pantry) {
        selectedPantryId.value = pantryId;
        selectedPantryName.value = pantry.name;
        showSharePantryModal.value = true;
        showPreviewPantryModal.value = false;
    }
};

const closeShareModal = () => {
    showSharePantryModal.value = false;
    selectedPantryId.value = undefined;
    selectedPantryName.value = "";
};

const handleAddProductsFromPreview = (pantryId: number) => {
    const pantry = pantries.value.find(p => p.id === pantryId);
    if (pantry) {
        selectedPantryId.value = pantryId;
        selectedPantryName.value = pantry.name;
        showAddProductsModal.value = true;
        showPreviewPantryModal.value = false;
    }
};

const closeAddProductsModal = () => {
    showAddProductsModal.value = false;
    // Reopen preview modal
    if (selectedPantryId.value && selectedPantryName.value) {
        showPreviewPantryModal.value = true;
    }
};

const confirmDelete = (id: number) => {
    pantryToDelete.value = id;
    showDeleteConfirm.value = true;
};

const handleDeletePantry = async () => {
    if (pantryToDelete.value) {
        await deletePantry(pantryToDelete.value);
        pantryToDelete.value = null;
    }
    showDeleteConfirm.value = false;
};

// Context menu items for each pantry
const getContextMenuItems = (pantryId: number, pantryName: string): ContextMenuItem[] => {
    return [
        {
            label: "Compartir",
            onClick: () => openShareModal(pantryId, pantryName),
            variant: "default"
        },
        {
            label: "Eliminar",
            onClick: () => confirmDelete(pantryId),
            variant: "danger"
        }
    ];
};

// Get subtitle for pantry based on ownership
const getPantrySubtitle = (pantry: Pantry): string => {
    if (pantry.owner && user.value) {
        if (pantry.owner.id === user.value.id) {
            return "Creada por mí";
        } else {
            return `Creada por ${pantry.owner.name} ${pantry.owner.surname || ''}`.trim();
        }
    }
    return "Mi despensa"; // fallback
};

</script>

<template>
    <div class="py-6 px-6 relative min-h-full">
        <PageHeader
            title="Despensa"
            :onAddClick="openCreatePantryModal"
            :showFilter="true"
        />

        <div class="space-y-3 pb-20">
            <ListItem
                v-for="pantry in pantries"
                :key="pantry.id"
                :title="pantry.name"
                :subtitle="getPantrySubtitle(pantry)"
                @click="openPreviewPantry(pantry.id!, pantry.name)"
                class="cursor-pointer hover:scale-[1.02] transition-transform"
            >
                <template #actions>
                    <ContextMenu
                        :items="getContextMenuItems(pantry.id!, pantry.name)"
                        icon-color="text-white"
                    />
                </template>
            </ListItem>
        </div>

        <div
            v-if="pantries.length === 0"
            class="text-center text-gray-500 mt-12"
        >
            <p class="text-lg">
                No tienes despensas todavía
            </p>
            <p class="text-sm">
                Haz clic en el botón + para
                crear una
            </p>
        </div>

        <!-- Modal para crear nueva despensa -->
        <CreatePantrySectionModal
            :show="showCreatePantryModal"
            @close="showCreatePantryModal = false"
            @create="handleCreatePantry"
        />

        <!-- Modal para vista previa de despensa -->
        <PreviewPantryModal
            :show="showPreviewPantryModal"
            :pantry-id="selectedPantryId"
            :pantry-name="selectedPantryName"
            @close="closePreviewPantry"
            @add-products="handleAddProductsFromPreview"
        />

        <!-- Modal para agregar productos -->
        <AddProductsToPantryModal
            :show="showAddProductsModal"
            :pantry-id="selectedPantryId"
            :pantry-name="selectedPantryName"
            @close="closeAddProductsModal"
        />

        <!-- Modal para compartir despensa -->
        <SharePantryModal
            :show="showSharePantryModal"
            :pantry-id="selectedPantryId"
            :pantry-name="selectedPantryName"
            @close="closeShareModal"
            @shared="() => {}"
        />

        <!-- Modal de confirmación para eliminar -->
        <ConfirmationModal
            :show="showDeleteConfirm"
            title="Eliminar despensa"
            message="¿Estás seguro de que quieres eliminar esta despensa?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            variant="danger"
            @confirm="handleDeletePantry"
            @cancel="showDeleteConfirm = false"
        >
            <template #details>
                <p
                    class="text-sm text-gray-600 mt-2"
                >
                    Esta acción no se puede
                    deshacer. Todos los
                    productos de la despensa
                    serán eliminados.
                </p>
            </template>
        </ConfirmationModal>
    </div>
</template>
