<script setup lang="ts">
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
} from "vue";
import { useListsStore } from "../stores/lists";
import PageHeader from "@/components/PageHeader.vue";
import CollapsibleSection from "@/components/CollapsibleSection.vue";
import ProductCard from "@/components/ProductCard.vue";
import ListItem from "@/components/ListItem.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import ContextMenu from "@/components/ContextMenu.vue";
import QuantityControls from "@/components/QuantityControls.vue";
import CreatePantrySectionModal from "@/components/CreatePantrySectionModal.vue";
import AddToPantryModal from "@/components/AddToPantryModal.vue";

const store = useListsStore();

const sectionsWithProducts = computed(
    () => {
        return store.pantrySections.map(
            (section) => {
                const items =
                    section.items
                        .map((item) => {
                            const product =
                                store.getProductById(
                                    item.productId,
                                );
                            return product
                                ? {
                                      ...item,
                                      product,
                                  }
                                : null;
                        })
                        .filter(
                            (item) =>
                                item !==
                                null,
                        );
                return {
                    ...section,
                    items,
                };
            },
        );
    },
);

const showDeleteConfirm = ref(false);
const itemToDelete = ref<{
    sectionId: string;
    productId: string;
} | null>(null);

const showCreateSectionModal =
    ref(false);
const showAddProductModal = ref(false);
const addProductToSection = ref<
    string | undefined
>(undefined);

const openCreateSectionModal = () => {
    showCreateSectionModal.value = true;
};

const openAddProductModal = (
    sectionId?: string,
) => {
    addProductToSection.value =
        sectionId;
    showAddProductModal.value = true;
};

const handleCreateSection = (
    name: string,
) => {
    // Aquí deberías tener un método en el store para crear una nueva sección
    // store.createPantrySection(name);
    console.log("Crear sección:", name);
    showCreateSectionModal.value = false;
};

const handleAddProduct = (
    productId: string,
    quantity: number,
    sectionId?: string,
) => {
    if (sectionId) {
        store.addToPantryInSection(
            sectionId,
            productId,
            quantity,
        );
    } else {
        store.addToPantry(
            productId,
            quantity,
        );
    }
    showAddProductModal.value = false;
    addProductToSection.value =
        undefined;
};

const updateQuantity = (
    sectionId: string,
    productId: string,
    change: number,
) => {
    // Obtener la cantidad actual
    const section =
        store.pantrySections.find(
            (s) => s.id === sectionId,
        );
    const item = section?.items.find(
        (i) =>
            i.productId === productId,
    );
    const currentQuantity =
        item?.quantity || 0;

    // Si la cantidad resultante es 0 o menos, mostrar confirmación
    if (currentQuantity + change <= 0) {
        confirmDeleteItem(
            sectionId,
            productId,
        );
        return;
    }

    if (change > 0)
        store.addToPantryInSection(
            sectionId,
            productId,
            change,
        );
    else
        store.removeFromPantryInSection(
            sectionId,
            productId,
            Math.abs(change),
        );
};

const modifyItem = (
    sectionId: string,
    productId: string,
    currentQty: number,
) => {
    const value = prompt(
        "Nueva cantidad:",
        String(currentQty),
    );
    if (value === null) return;
    const qty = parseInt(value);
    if (isNaN(qty)) return;
    store.setPantryQuantityInSection(
        sectionId,
        productId,
        qty,
    );
};

const confirmDeleteItem = (
    sectionId: string,
    productId: string,
) => {
    itemToDelete.value = {
        sectionId,
        productId,
    };
    showDeleteConfirm.value = true;
};

const deleteItem = () => {
    if (itemToDelete.value) {
        store.removeItemFromPantryInSection(
            itemToDelete.value
                .sectionId,
            itemToDelete.value
                .productId,
        );
    }
    showDeleteConfirm.value = false;
    itemToDelete.value = null;
};

const shareSection = (
    sectionId: string,
) => {
    const section =
        store.pantrySections.find(
            (s) => s.id === sectionId,
        );
    if (!section) return;

    const items = section.items
        .map((item) => {
            const product =
                store.getProductById(
                    item.productId,
                );
            return product
                ? `${product.name} (${item.quantity})`
                : null;
        })
        .filter((item) => item !== null)
        .join("\n");

    const shareText = `Mi despensa - ${section.name}:\n${items}`;

    if (navigator.share) {
        navigator
            .share({
                title: `Despensa - ${section.name}`,
                text: shareText,
            })
            .catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard
            .writeText(shareText)
            .then(() => {
                alert(
                    "Lista copiada al portapapeles",
                );
            })
            .catch(() => {
                // Fallback for older browsers
                const textArea =
                    document.createElement(
                        "textarea",
                    );
                textArea.value =
                    shareText;
                document.body.appendChild(
                    textArea,
                );
                textArea.select();
                document.execCommand(
                    "copy",
                );
                document.body.removeChild(
                    textArea,
                );
                alert(
                    "Lista copiada al portapapeles",
                );
            });
    }
};
</script>

<template>
    <div
        class="py-6 px-6 relative min-h-full"
    >
        <PageHeader
            title="Despensa"
            :onAddClick="
                openCreateSectionModal
            "
            :showFilter="true"
        />

        <div class="space-y-8 pb-20">
            <CollapsibleSection
                v-for="section in sectionsWithProducts"
                :key="section.id"
                :title="section.name"
                :showAddButton="true"
                addButtonText="Agregar"
                :onAddClick="
                    () =>
                        openAddProductModal(
                            section.id,
                        )
                "
                :showShareButton="true"
                shareButtonText="Compartir"
                :onShareClick="
                    () =>
                        shareSection(
                            section.id,
                        )
                "
            >
                <div class="space-y-3">
                    <div
                        v-for="item in section.items"
                        :key="
                            section.id +
                            '-' +
                            item.productId
                        "
                        class="bg-verde-claro rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative"
                    >
                        <div
                            class="flex items-center justify-between"
                        >
                            <!-- Lado izquierdo: Imagen/Icono y textos -->
                            <div
                                class="flex items-center gap-4 flex-1"
                            >
                                <!-- Imagen del producto -->
                                <div
                                    class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/90 flex items-center justify-center"
                                >
                                    <img
                                        v-if="
                                            item
                                                .product
                                                .image
                                        "
                                        :src="
                                            item
                                                .product
                                                .image
                                        "
                                        :alt="
                                            item
                                                .product
                                                .name
                                        "
                                        class="w-full h-full object-cover"
                                    />
                                    <span
                                        v-else
                                        class="text-3xl"
                                        >{{
                                            item
                                                .product
                                                .icon
                                        }}</span
                                    >
                                </div>
                                <div
                                    class="flex-1 min-w-0"
                                >
                                    <h3
                                        class="text-white font-semibold text-lg"
                                    >
                                        {{
                                            item
                                                .product
                                                .name
                                        }}
                                    </h3>
                                    <p
                                        class="text-white/80 text-sm"
                                    >
                                        {{
                                            item
                                                .product
                                                .category
                                        }}
                                    </p>
                                </div>
                            </div>

                            <!-- Lado derecho: Controles -->
                            <div
                                class="flex items-center gap-3"
                                @click.stop
                            >
                                <!-- Controles de cantidad (para DespensaView) -->
                                <QuantityControls
                                    :quantity="
                                        item.quantity
                                    "
                                    @increment="
                                        updateQuantity(
                                            section.id,
                                            item.productId,
                                            1,
                                        )
                                    "
                                    @decrement="
                                        updateQuantity(
                                            section.id,
                                            item.productId,
                                            -1,
                                        )
                                    "
                                />

                                <!-- Slot para acciones personalizadas (estrella, menú contextual, etc) -->
                                <ContextMenu
                                    :items="[
                                        {
                                            label: 'Modificar',
                                            onClick:
                                                () =>
                                                    modifyItem(
                                                        section.id,
                                                        item.productId,
                                                        item.quantity,
                                                    ),
                                        },
                                        {
                                            label: 'Eliminar',
                                            onClick:
                                                () =>
                                                    confirmDeleteItem(
                                                        section.id,
                                                        item.productId,
                                                    ),
                                            variant:
                                                'danger',
                                        },
                                    ]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>
        </div>

        <div
            v-if="
                sectionsWithProducts.every(
                    (s) =>
                        s.items
                            .length ===
                        0,
                )
            "
            class="text-center text-gray-500 mt-12"
        >
            <p class="text-lg">
                Tu despensa está vacía
            </p>
            <p class="text-sm">
                Haz clic en el botón +
                para agregar productos
            </p>
        </div>

        <ConfirmationModal
            :show="showDeleteConfirm"
            title="Eliminar producto"
            message="¿Estás seguro de que quieres eliminar este producto de la despensa?"
            variant="danger"
            @confirm="deleteItem"
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

        <CreatePantrySectionModal
            :show="
                showCreateSectionModal
            "
            @close="
                showCreateSectionModal = false
            "
            @create="
                handleCreateSection
            "
        />

        <AddToPantryModal
            :show="showAddProductModal"
            :section-id="
                addProductToSection
            "
            @close="
                showAddProductModal = false
            "
            @add="handleAddProduct"
        />
    </div>
</template>
