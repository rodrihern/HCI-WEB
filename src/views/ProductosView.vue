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

// Estado para loading
const isLoading = ref(false);

// Ref para el modal de producto
const createProductModalRef =
    ref<InstanceType<
        typeof CreateProductModal
    > | null>(null);

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
        isLoading.value = true;
        try {
            await deleteProductApi(
                productToDelete.value,
            );
        } catch (error: any) {
            // Mostrar error si falla la eliminación
            if (
                createProductModalRef.value
            ) {
                createProductModalRef.value.showError(
                    error.message ||
                        "Error al eliminar el producto",
                );
            }
        } finally {
            isLoading.value = false;
        }
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

// Manejar creación/edición de producto desde el modal
const handleSaveProduct =
    async (productData: {
        name: string;
        categoryId?: number;
        description?: string;
        image?: string;
    }) => {
        isLoading.value = true;
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

                if (productData.image) {
                    metadata.image =
                        productData.image;
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

                if (productData.image) {
                    metadata.image =
                        productData.image;
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
            // Mostrar mensaje de error en el modal
            let errorMsg =
                "Ocurrió un error al guardar el producto. Por favor intenta de nuevo.";

            if (
                error.message ===
                "Product already exists"
            ) {
                errorMsg = `Ya existe un producto con el nombre "${productData.name}". Por favor usa otro nombre.`;
            } else if (error.message) {
                errorMsg =
                    error.message;
            }

            // Mostrar error en el modal usando el ref
            if (
                createProductModalRef.value
            ) {
                createProductModalRef.value.showError(
                    errorMsg,
                );
            }
        } finally {
            isLoading.value = false;
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
            ref="createProductModalRef"
            :show="showModal"
            :product-to-edit="
                productToEdit
            "
            :categories="categories"
            :loading="isLoading"
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

        <!-- Loading Overlay (solo cuando no hay modal abierto) -->
        <div
            v-if="
                isLoading && !showModal
            "
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
            <div
                class="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            >
                <svg
                    class="animate-spin h-12 w-12 text-verde-sidebar"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p
                    class="text-gray-700 font-medium text-lg"
                >
                    Procesando...
                </p>
            </div>
        </div>
    </div>
</template>
