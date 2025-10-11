<script setup lang="ts">
import { computed, ref } from "vue";
import { useProduct } from "@/composables/product";
import { useCategory } from "@/composables/category";
import PageHeader from "@/components/PageHeader.vue";
import CollapsibleSection from "@/components/CollapsibleSection.vue";
import ProductCard from "@/components/ProductCard.vue";
import CreateProductModal from "@/components/CreateProductModal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import AddToListModal from "@/components/AddToListModal.vue";

// Estado para mensajes de error
const showErrorModal = ref(false);
const errorMessage = ref("");

const {
    products,
    createProduct,
    modifyProduct,
    deleteProduct: deleteProductApi,
} = useProduct();
const { categories } = useCategory();

const productsByCategory = computed(
    () => {
        const grouped: Record<
            string,
            typeof products.value
        > = {};
        products.value.forEach(
            (product) => {
                const categoryName =
                    product.category
                        ?.name ||
                    "Sin categoría";
                const categoryGroup =
                    grouped[
                        categoryName
                    ] || [];
                categoryGroup.push(
                    product,
                );
                grouped[categoryName] =
                    categoryGroup;
            },
        );
        return grouped;
    },
);

// Distribuir productos en dos columnas
const distributeInColumns = (
    productsList: typeof products.value,
) => {
    const column1: typeof products.value =
        [];
    const column2: typeof products.value =
        [];

    productsList.forEach(
        (product, index) => {
            if (index % 2 === 0) {
                column1.push(product);
            } else {
                column2.push(product);
            }
        },
    );

    return { column1, column2 };
};

// Modal state
const showModal = ref(false);
const showDeleteConfirmation =
    ref(false);
const showAddToListModal = ref(false);
const productToDelete = ref<
    number | null
>(null);
const productToEdit = ref<
    (typeof products.value)[0] | null
>(null);
const productToAddToList = ref<{
    id: number;
    name: string;
} | null>(null);

const openAddProductModal = () => {
    productToEdit.value = null;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    productToEdit.value = null;
};

// Acciones del menú contextual
const handleDeleteProduct = (
    productId: string,
) => {
    productToDelete.value =
        parseInt(productId);
    showDeleteConfirmation.value = true;
};

const confirmDelete = async () => {
    if (productToDelete.value) {
        await deleteProductApi(
            productToDelete.value,
        );
    }
    showDeleteConfirmation.value = false;
    productToDelete.value = null;
};

const cancelDelete = () => {
    showDeleteConfirmation.value = false;
    productToDelete.value = null;
};

const handleEditProduct = (
    productId: string,
) => {
    const product = products.value.find(
        (p) =>
            p.id ===
            parseInt(productId),
    );
    if (product) {
        productToEdit.value = product;
        showModal.value = true;
    }
};

const handleAddToList = (
    productId: string,
) => {
    const product = products.value.find(
        (p) =>
            p.id ===
            parseInt(productId),
    );
    if (product && product.id) {
        productToAddToList.value = {
            id: product.id,
            name: product.name,
        };
        showAddToListModal.value = true;
    }
};

const closeAddToListModal = () => {
    showAddToListModal.value = false;
    productToAddToList.value = null;
};

const closeErrorModal = () => {
    showErrorModal.value = false;
    errorMessage.value = "";
};

// Manejar creación/edición de producto desde el modal
const handleSaveProduct =
    async (productData: {
        name: string;
        categoryId?: number;
        description?: string;
        image?: string;
    }) => {
        try {
            if (
                productToEdit.value &&
                productToEdit.value.id
            ) {
                // Modo edición
                const metadata: Record<
                    string,
                    any
                > = {
                    ...productToEdit
                        .value.metadata,
                };

                if (
                    productData.description
                ) {
                    metadata.description =
                        productData.description;
                }

                await modifyProduct(
                    productToEdit.value
                        .id,
                    {
                        name: productData.name,
                        category_id:
                            productData.categoryId,
                        metadata,
                    },
                );
            } else {
                // Modo creación
                const metadata: Record<
                    string,
                    any
                > = {};

                if (
                    productData.description
                ) {
                    metadata.description =
                        productData.description;
                }

                await createProduct(
                    productData.name,
                    productData.categoryId,
                    undefined,
                    Object.keys(
                        metadata,
                    ).length > 0
                        ? metadata
                        : undefined,
                );
            }

            closeModal();
        } catch (error: any) {
            // Mostrar mensaje de error al usuario
            if (
                error.message ===
                "Product already exists"
            ) {
                errorMessage.value = `Ya existe un producto con el nombre "${productData.name}". Por favor usa otro nombre.`;
            } else {
                errorMessage.value =
                    error.message ||
                    "Ocurrió un error al guardar el producto. Por favor intenta de nuevo.";
            }

            showErrorModal.value = true;
        }
    };
</script>

<template>
    <div
        class="py-6 px-6 relative min-h-full"
    >
        <PageHeader
            title="Productos"
            :onAddClick="
                openAddProductModal
            "
            :showFilter="true"
        />

        <div class="space-y-6 pb-20">
            <CollapsibleSection
                v-for="(
                    products, category
                ) in productsByCategory"
                :key="category"
                :title="category"
            >
                <!-- Dos columnas independientes -->
                <div
                    class="flex flex-col md:flex-row gap-3"
                >
                    <!-- Columna 1 -->
                    <div
                        class="flex-1 space-y-3"
                    >
                        <ProductCard
                            v-for="product in distributeInColumns(
                                products,
                            ).column1"
                            :key="
                                product.id
                            "
                            :product-id="
                                String(
                                    product.id,
                                )
                            "
                            :icon="
                                product
                                    .metadata
                                    ?.icon ||
                                '🛒'
                            "
                            :name="
                                product.name
                            "
                            :category="
                                product
                                    .category
                                    ?.name ||
                                'Sin categoría'
                            "
                            :description="
                                product
                                    .metadata
                                    ?.description
                            "
                            :image="
                                product
                                    .metadata
                                    ?.image
                            "
                            @delete="
                                handleDeleteProduct
                            "
                            @edit="
                                handleEditProduct
                            "
                            @add-to-list="
                                handleAddToList
                            "
                        />
                    </div>

                    <!-- Columna 2 -->
                    <div
                        class="flex-1 space-y-3"
                    >
                        <ProductCard
                            v-for="product in distributeInColumns(
                                products,
                            ).column2"
                            :key="
                                product.id
                            "
                            :product-id="
                                String(
                                    product.id,
                                )
                            "
                            :icon="
                                product
                                    .metadata
                                    ?.icon ||
                                '🛒'
                            "
                            :name="
                                product.name
                            "
                            :category="
                                product
                                    .category
                                    ?.name ||
                                'Sin categoría'
                            "
                            :description="
                                product
                                    .metadata
                                    ?.description
                            "
                            :image="
                                product
                                    .metadata
                                    ?.image
                            "
                            @delete="
                                handleDeleteProduct
                            "
                            @edit="
                                handleEditProduct
                            "
                            @add-to-list="
                                handleAddToList
                            "
                        />
                    </div>
                </div>
            </CollapsibleSection>
        </div>

        <div
            v-if="products.length === 0"
            class="text-center text-gray-500 mt-12"
        >
            <p class="text-lg">
                No tienes productos
                todavía
            </p>
            <p class="text-sm">
                Haz clic en el botón +
                para crear uno
            </p>
        </div>

        <!-- Modal Add/Edit Product -->
        <CreateProductModal
            :show="showModal"
            :product-to-edit="
                productToEdit
            "
            :categories="categories"
            @close="closeModal"
            @save="handleSaveProduct"
        />

        <!-- Modal Confirmación de Eliminación -->
        <ConfirmationModal
            :show="
                showDeleteConfirmation
            "
            title="Eliminar Producto"
            message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            variant="danger"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />

        <!-- Modal Añadir a Lista -->
        <AddToListModal
            v-if="productToAddToList"
            :show="showAddToListModal"
            :product-id="
                String(
                    productToAddToList.id,
                )
            "
            :product-name="
                productToAddToList.name
            "
            @close="closeAddToListModal"
        />

        <!-- Modal de Error -->
        <ConfirmationModal
            :show="showErrorModal"
            title="Error"
            :message="errorMessage"
            confirm-text="Entendido"
            cancel-text=""
            variant="info"
            @confirm="closeErrorModal"
            @cancel="closeErrorModal"
        />
    </div>
</template>
