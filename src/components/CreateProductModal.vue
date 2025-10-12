<script setup lang="ts">
import {
    computed,
    ref,
    watch,
} from "vue";
import BaseModal from "./BaseModal.vue";
import type { Product } from "@/api/product";
import type { Category } from "@/api/category";
import { useCategory } from "@/composables/category";

interface Props {
    show: boolean;
    productToEdit?: Product | null;
    categories?: Category[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    close: [];
    save: [
        productData: {
            name: string;
            categoryId?: number;
            description?: string;
            image?: string;
        },
    ];
}>();

const {
    createCategory: createCategoryApi,
    categories: allCategories,
} = useCategory();

// Modal state
const productName = ref("");
const productDescription = ref("");
const selectedCategoryId = ref<
    number | undefined
>(undefined);
const categorySearch = ref("");
const isCategoryOpen = ref(false);
const newCategoryName = ref("");
const selectedFile = ref<File | null>(
    null,
);
const existingImage = ref<
    string | undefined
>(undefined);
const imagePreview = ref<
    string | undefined
>(undefined);
const errorMessage = ref("");

// Modo edición
const isEditMode = computed(
    () => !!props.productToEdit,
);

// Imagen a mostrar (preview de nueva imagen o imagen existente)
const displayImage = computed(
    () =>
        imagePreview.value ||
        existingImage.value,
);

// Categorías disponibles (usar las que vienen por props o las del composable)
const availableCategories = computed(
    () =>
        props.categories ||
        allCategories.value ||
        [],
);

// Nombre de la categoría seleccionada
const selectedCategoryName = computed(
    () => {
        if (!selectedCategoryId.value)
            return "";
        const category =
            availableCategories.value.find(
                (c) =>
                    c.id ===
                    selectedCategoryId.value,
            );
        return category?.name || "";
    },
);

// Cargar datos del producto cuando se abre en modo edición
watch(
    () => props.productToEdit,
    (product) => {
        if (product) {
            productName.value =
                product.name;
            productDescription.value =
                product.metadata
                    ?.description || "";
            selectedCategoryId.value =
                product.category_id;
            existingImage.value =
                product.metadata?.image;
            selectedFile.value = null;
            imagePreview.value =
                undefined;
            isCategoryOpen.value = false;
            errorMessage.value = "";
        }
    },
);

// Limpiar error cuando el usuario empiece a escribir
watch(productName, () => {
    if (errorMessage.value) {
        errorMessage.value = "";
    }
});

const filteredCategories = computed(
    () => {
        const term =
            categorySearch.value
                .trim()
                .toLowerCase();
        if (!term)
            return availableCategories.value;
        return availableCategories.value.filter(
            (c) =>
                c.name
                    .toLowerCase()
                    .includes(term),
        );
    },
);

const closeModal = () => {
    productName.value = "";
    productDescription.value = "";
    selectedCategoryId.value =
        undefined;
    categorySearch.value = "";
    newCategoryName.value = "";
    selectedFile.value = null;
    existingImage.value = undefined;
    imagePreview.value = undefined;
    isCategoryOpen.value = false;
    errorMessage.value = "";
    emit("close");
};

const onFileChange = (e: Event) => {
    const files = (
        e.target as HTMLInputElement
    ).files;
    if (files && files[0]) {
        const file = files[0];

        // Validar tamaño (máximo 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB en bytes
        if (file.size > maxSize) {
            errorMessage.value =
                "La imagen es demasiado grande. El tamaño máximo es 2MB.";
            selectedFile.value = null;
            imagePreview.value =
                undefined;
            // Limpiar el input
            (
                e.target as HTMLInputElement
            ).value = "";
            return;
        }

        // Validar tipo de archivo
        const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (
            !validTypes.includes(
                file.type,
            )
        ) {
            errorMessage.value =
                "Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).";
            selectedFile.value = null;
            imagePreview.value =
                undefined;
            (
                e.target as HTMLInputElement
            ).value = "";
            return;
        }

        // Limpiar error si había uno
        errorMessage.value = "";

        selectedFile.value = file;
        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.value = event
                .target
                ?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        selectedFile.value = null;
        imagePreview.value = undefined;
    }
};

const removeImage = () => {
    selectedFile.value = null;
    imagePreview.value = undefined;
    existingImage.value = undefined;
    errorMessage.value = "";
};

const chooseCategory = (
    categoryId: number,
) => {
    selectedCategoryId.value =
        categoryId;
    isCategoryOpen.value = false;
};

const addNewCategory = async () => {
    const name =
        newCategoryName.value.trim();
    if (!name) return;

    try {
        // Crear la categoría en la API y obtener el resultado directamente
        const newCategory =
            await createCategoryApi(
                name,
            );

        // Usar el ID de la categoría recién creada
        if (newCategory?.id) {
            selectedCategoryId.value =
                newCategory.id;
        }

        newCategoryName.value = "";
        isCategoryOpen.value = false;
    } catch (error) {
        console.error(
            "Error creating category:",
            error,
        );
    }
};

const submitProduct = async () => {
    const name =
        productName.value.trim();
    if (!name) return;

    // Limpiar error previo
    errorMessage.value = "";

    const description =
        productDescription.value.trim();

    // Convertir imagen a base64 si hay una nueva seleccionada
    let imageBase64 =
        existingImage.value;
    if (selectedFile.value) {
        // Convertir nueva imagen a base64
        const reader = new FileReader();
        imageBase64 =
            await new Promise<string>(
                (resolve) => {
                    reader.onload = (
                        e,
                    ) =>
                        resolve(
                            e.target
                                ?.result as string,
                        );
                    reader.readAsDataURL(
                        selectedFile.value!,
                    );
                },
            );
    }

    emit("save", {
        name,
        categoryId:
            selectedCategoryId.value,
        description:
            description || undefined,
        image: imageBase64,
    });
};

// Función para mostrar error (llamada desde el padre)
const showError = (message: string) => {
    errorMessage.value = message;
};

// Exponer función para que el padre pueda llamarla
defineExpose({
    showError,
});
</script>

<template>
    <BaseModal
        :show="show"
        :title="
            isEditMode
                ? 'Editar Producto'
                : 'Nuevo Producto'
        "
        max-width="3xl"
        height="auto"
        @close="closeModal"
    >
        <!-- Contenido del modal de producto -->
        <div
            class="p-8 space-y-4 bg-gray-50"
        >
            <!-- Error message -->
            <div
                v-if="errorMessage"
                class="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
                <p
                    class="text-sm text-red-600 text-center"
                >
                    {{ errorMessage }}
                </p>
            </div>

            <!-- Name input -->
            <div>
                <input
                    v-model="
                        productName
                    "
                    type="text"
                    placeholder="Nombre del producto"
                    class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white"
                />
            </div>

            <!-- Category selector -->
            <div class="relative">
                <button
                    type="button"
                    class="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 hover:border-verde-sidebar transition-colors"
                    @click="
                        isCategoryOpen =
                            !isCategoryOpen
                    "
                >
                    <svg
                        class="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                    >
                        <use
                            href="@/assets/sprite.svg#search"
                        />
                    </svg>
                    <span
                        class="flex-1 text-left text-lg"
                        >{{
                            selectedCategoryName ||
                            "Categoría"
                        }}</span
                    >
                    <span
                        v-if="
                            selectedCategoryId
                        "
                        class="p-1 -mr-1 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                        @click.stop="
                            selectedCategoryId =
                                undefined
                        "
                        aria-label="clear"
                    >
                        <svg
                            class="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                        >
                            <use
                                href="@/assets/sprite.svg#close"
                            />
                        </svg>
                    </span>
                </button>

                <div
                    v-if="
                        isCategoryOpen
                    "
                    class="absolute left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-xl overflow-hidden z-10"
                    @click.stop
                >
                    <div
                        class="px-4 py-3 bg-gray-50 flex items-center gap-2 border-b border-gray-200"
                    >
                        <svg
                            class="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                        >
                            <use
                                href="@/assets/sprite.svg#search"
                            />
                        </svg>
                        <input
                            v-model="
                                categorySearch
                            "
                            type="text"
                            placeholder="Buscar categoría"
                            class="flex-1 bg-transparent placeholder-gray-500 text-gray-800 outline-none"
                        />
                        <span
                            v-if="
                                categorySearch
                            "
                            class="p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors"
                            @click="
                                categorySearch =
                                    ''
                            "
                        >
                            <svg
                                class="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                            >
                                <use
                                    href="@/assets/sprite.svg#close"
                                />
                            </svg>
                        </span>
                    </div>

                    <div
                        class="max-h-48 overflow-auto"
                    >
                        <button
                            v-for="c in filteredCategories"
                            :key="c.id"
                            class="w-full text-left px-5 py-3 hover:bg-verde-claro hover:text-white border-b border-gray-100 last:border-b-0 transition-colors text-gray-800"
                            @click="
                                chooseCategory(
                                    c.id!,
                                )
                            "
                        >
                            {{ c.name }}
                        </button>
                        <div
                            v-if="
                                filteredCategories.length ===
                                    0 &&
                                categorySearch
                            "
                            class="px-5 py-4 text-center text-gray-500 text-sm"
                        >
                            No se
                            encontraron
                            categorías
                        </div>
                    </div>

                    <div
                        class="border-t-2 border-gray-200 px-4 py-3 flex items-center gap-2 bg-gray-50"
                    >
                        <svg
                            class="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 5v14m-7-7h14"
                            />
                        </svg>
                        <input
                            v-model="
                                newCategoryName
                            "
                            type="text"
                            placeholder="Nueva categoría"
                            class="flex-1 bg-transparent placeholder-gray-500 text-gray-800 outline-none"
                            @keyup.enter="
                                addNewCategory
                            "
                        />
                        <button
                            class="px-4 py-2 bg-verde-sidebar text-white rounded-lg hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="
                                !newCategoryName.trim()
                            "
                            @click="
                                addNewCategory
                            "
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Description input -->
            <div>
                <div class="relative">
                    <textarea
                        v-model="
                            productDescription
                        "
                        maxlength="200"
                        placeholder="Descripción del producto (opcional)"
                        class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-verde-sidebar focus:outline-none transition-colors text-gray-800 bg-white resize-none"
                        rows="3"
                    ></textarea>
                    <div
                        class="absolute bottom-3 right-4 text-sm text-gray-400"
                    >
                        {{
                            productDescription.length
                        }}/200
                    </div>
                </div>
            </div>

            <!-- Media drop area -->
            <label class="block">
                <div
                    class="w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-verde-sidebar transition-colors bg-white overflow-hidden relative group"
                >
                    <!-- Preview de la imagen -->
                    <div
                        v-if="
                            displayImage
                        "
                        class="absolute inset-0 flex items-center justify-center p-2"
                    >
                        <img
                            :src="
                                displayImage
                            "
                            alt="Preview"
                            class="max-w-full max-h-full object-contain"
                        />
                        <!-- Botón para eliminar imagen -->
                        <button
                            @click.stop="
                                removeImage
                            "
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
                            type="button"
                            aria-label="Eliminar imagen"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <!-- Overlay al hover para cambiar imagen -->
                        <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <div
                                class="text-white text-center"
                            >
                                <svg
                                    class="w-10 h-10 mb-2 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span
                                    class="text-sm font-medium"
                                    >Cambiar
                                    imagen</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Estado vacío (sin imagen) -->
                    <div
                        v-else
                        class="text-gray-500 flex flex-col items-center group-hover:text-verde-sidebar transition-colors"
                    >
                        <svg
                            class="w-10 h-10 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span
                            class="text-sm font-medium"
                            >Añadir
                            Multimedia</span
                        >
                        <span
                            class="text-xs mt-2 text-gray-400"
                            >JPG, PNG,
                            GIF, WEBP
                            (máx.
                            2MB)</span
                        >
                    </div>
                </div>
                <input
                    type="file"
                    class="hidden"
                    @change="
                        onFileChange
                    "
                    accept="image/*"
                />
            </label>

            <!-- Botones de acción -->
            <div
                class="flex justify-end gap-3 pt-4"
            >
                <button
                    class="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
                    @click="closeModal"
                >
                    Cancelar
                </button>
                <button
                    class="px-6 py-2.5 rounded-xl bg-verde-sidebar hover:bg-verde-contraste text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="
                        !productName.trim()
                    "
                    @click="
                        submitProduct
                    "
                >
                    Guardar
                </button>
            </div>
        </div>
    </BaseModal>
</template>
