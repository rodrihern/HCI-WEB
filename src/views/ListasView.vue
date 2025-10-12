<script setup lang="ts">
import { computed, ref } from 'vue'
import { useListsStore } from '../stores/lists'
import { useShoppingList } from '@/composables/shoppingList'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useUser } from '@/composables/user'
import { ShoppingListApi } from '@/api/shoppingList'
import PageHeader from '@/components/PageHeader.vue'
import CreateItemModal from '@/components/CreateItemModal.vue'
import PreviewItemsModal from '@/components/PreviewItemsModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ListItem from '@/components/ListItem.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import BaseModal from '@/components/BaseModal.vue'
import type { ContextMenuItem } from '@/components/ContextMenu.vue'
import type { ShoppingListData } from '@/api/shoppingList'
import SearchEmptyState from '@/components/SearchEmptyState.vue'
import { useSearchFilter } from '@/composables/search'

const store = useListsStore()
const shoppingListStore = useShoppingListStore()
const { shoppingLists, deleteShoppingList, getAllShoppingLists } = useShoppingList()
const { user } = useUser()
const animatingFavorites = ref<Set<number>>(new Set())

// Estado local para el modal de creación
const showCreateListModal = ref(false)

const {
    filteredItems: filteredShoppingLists,
    isSearching,
} = useSearchFilter(
    shoppingLists,
    (list, query) => {
        const name =
            list.name?.toLowerCase() ??
            ''
        const description =
            list.description?.toLowerCase() ??
            ''
        return (
            name.includes(query) ||
            description.includes(query)
        )
    },
)

// Estado del modal de confirmación
const showDeleteConfirm = ref(false);
const listToDelete = ref<number | null>(
    null,
);

// Estado del modal de compartir
const showShareModal = ref(false);
const listToShare = ref<number | null>(
    null,
);
const shareEmail = ref("");
const isSharing = ref(false);
const shareError = ref("");
const shareSuccess = ref(false);

const sortedLists = computed(() => {
    const lists = [
        ...filteredShoppingLists.value,
    ];

    return lists.sort((a, b) => {
        // Primero por recurrentes
        const aRec =
            a.recurring === true
                ? 1
                : 0;
        const bRec =
            b.recurring === true
                ? 1
                : 0;
        if (aRec !== bRec)
            return bRec - aRec;

        // Luego por fecha de creación (más reciente primero)
        const dateA = new Date(
            a.createdAt || 0,
        ).getTime();
        const dateB = new Date(
            b.createdAt || 0,
        ).getTime();
        return dateB - dateA;
    });
});

const addNewList = () => {
  showCreateListModal.value = true
}

const handleCreateList = async (name: string) => {
  try {
    await shoppingListStore.add({
      name,
      description: 'Nueva lista',
      recurring: false,
      metadata: {}
    })
    await getAllShoppingLists()
    showCreateListModal.value = false
  } catch (error) {
    console.error('Error creating list:', error)
    alert('Error al crear la lista. Por favor intenta de nuevo.')
  }
}

const openPreviewList = (
    listId: number,
) => {
    store.openPreviewListModal(
        String(listId),
    );
};

const getListSubtitle = (
    list: ShoppingListData,
): string => {
    if (!list.owner) {
        return "Creada por mí"; // Si no hay owner, asumimos que es del usuario actual
    }

    // Check if current user is the owner
    // Convert both IDs to numbers for comparison in case one is a string
    const currentUserId = user.value?.id
        ? Number(user.value.id)
        : null;
    const ownerId = list.owner.id
        ? Number(list.owner.id)
        : null;

    if (
        currentUserId &&
        ownerId &&
        currentUserId === ownerId
    ) {
        return "Creada por mí";
    }

    // Show owner name
    const ownerName =
        list.owner.name ||
        list.owner.email?.split(
            "@",
        )[0] ||
        "Usuario";
    return `Creada por ${ownerName}`;
};

const confirmDelete = (id: number) => {
    listToDelete.value = id;
    showDeleteConfirm.value = true;
};

const deleteList = async () => {
    if (listToDelete.value) {
        await deleteShoppingList(
            listToDelete.value,
        );
        listToDelete.value = null;
    }
    showDeleteConfirm.value = false;
};

const isListOwner = (
    listId: number,
): boolean => {
    const list =
        shoppingLists.value.find(
            (l) => l.id === listId,
        );
    if (!list?.owner || !user.value?.id)
        return false;

    const currentUserId = Number(
        user.value.id,
    );
    const ownerId = Number(
        list.owner.id,
    );

    return currentUserId === ownerId;
};

const toggleRecurringWithAnimation =
    async (id: number) => {
        // Agregar animación
        animatingFavorites.value.add(
            id,
        );

        // Encontrar la lista
        const list =
            shoppingLists.value.find(
                (l) => l.id === id,
            );
        if (list) {
            try {
                // Toggle recurring
                const updatedList = {
                    ...list,
                    recurring:
                        !list.recurring,
                };

                // Actualizar en API
                const {
                    useShoppingListStore,
                } = await import(
                    "@/stores/shoppingList"
                );
                const shoppingListStore =
                    useShoppingListStore();
                await shoppingListStore.modify(
                    updatedList,
                );
            } catch (error) {
                console.error(
                    "Error toggling recurring:",
                    error,
                );
            }
        }

        // Remover animación
        setTimeout(() => {
            animatingFavorites.value.delete(
                id,
            );
        }, 400);
    };

// Funciones del menú de contexto
const getContextMenuItems = (
    listId: number,
): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
        {
            label: "Editar",
            onClick: () =>
                openPreviewList(listId),
        },
    ];

    // Only show share and delete options for owners
    if (isListOwner(listId)) {
        items.push(
            {
                label: "Compartir",
                onClick: () =>
                    openShareModal(
                        listId,
                    ),
            },
            {
                label: "Eliminar",
                onClick: () =>
                    confirmDelete(
                        listId,
                    ),
                variant: "danger",
            },
        );
    }

    return items;
};

// Modal de compartir
const openShareModal = (
    listId: number,
) => {
    listToShare.value = listId;
    shareEmail.value = "";
    shareError.value = "";
    shareSuccess.value = false;
    showShareModal.value = true;
};

const closeShareModal = () => {
    showShareModal.value = false;
    listToShare.value = null;
    shareEmail.value = "";
    shareError.value = "";
    shareSuccess.value = false;
};

const shareList = async () => {
    if (
        !listToShare.value ||
        !shareEmail.value.trim()
    ) {
        shareError.value =
            "Por favor ingresa un email válido";
        return;
    }

    isSharing.value = true;
    shareError.value = "";
    shareSuccess.value = false;

    try {
        await ShoppingListApi.share(
            listToShare.value,
            shareEmail.value.trim(),
        );
        shareSuccess.value = true;
        shareEmail.value = "";

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
            closeShareModal();
        }, 1500);
    } catch (error: any) {
        console.error(
            "Error sharing list:",
            error,
        );
        shareError.value =
            error.message ||
            "Error al compartir la lista. Intenta de nuevo.";
    } finally {
        isSharing.value = false;
    }
};
</script>

<template>
    <div
        class="py-6 px-6 relative min-h-full"
    >
        <PageHeader
            title="Mis listas"
            :onAddClick="addNewList"
            :show-add-button="true"
        />

        <div class="space-y-3 pb-20">
            <transition-group
                name="list-move"
            >
                <ListItem
                    v-for="list in sortedLists"
                    :key="list.id"
                    :title="list.name"
                    :subtitle="
                        getListSubtitle(
                            list,
                        )
                    "
                    :is-animating="
                        list.id
                            ? animatingFavorites.has(
                                  list.id,
                              )
                            : false
                    "
                    @click="
                        list.id &&
                        openPreviewList(
                            list.id,
                        )
                    "
                    class="cursor-pointer hover:scale-[1.02] transition-transform"
                >
                    <template #actions>
                        <div
                            class="flex items-center gap-1"
                        >
                            <!-- Star Button -->
                            <button
                                v-if="
                                    list.id &&
                                    isListOwner(
                                        list.id,
                                    )
                                "
                                @click.stop="
                                    toggleRecurringWithAnimation(
                                        list.id,
                                    )
                                "
                                class="p-2 hover:scale-110 transition-transform duration-200"
                                :title="
                                    list.recurring
                                        ? 'Lista recurrente'
                                        : 'Hacer recurrente'
                                "
                            >
                                <!-- Filled Star (Recurring) -->
                                <svg
                                    v-if="
                                        list.recurring
                                    "
                                    class="w-7 h-7 text-yellow-300 transition-all duration-200"
                                    :class="{
                                        'favorite-bounce':
                                            list.id &&
                                            animatingFavorites.has(
                                                list.id,
                                            ),
                                    }"
                                    stroke="currentColor"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    />
                                </svg>
                                <!-- Outline Star (Not Recurring) -->
                                <svg
                                    v-else
                                    class="w-7 h-7 text-white opacity-60 hover:opacity-100 transition-all duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    />
                                </svg>
                            </button>

                            <!-- Context Menu (3 dots) -->
                            <div
                                @click.stop
                                class="relative z-50"
                            >
                                <ContextMenu
                                    v-if="
                                        list.id
                                    "
                                    :items="
                                        getContextMenuItems(
                                            list.id,
                                        )
                                    "
                                    icon-color="text-white opacity-60 hover:opacity-100"
                                />
                            </div>
                        </div>
                    </template>
                </ListItem>
            </transition-group>
        </div>

        <SearchEmptyState
            :show="sortedLists.length === 0"
            :is-searching="isSearching"
            empty-title="No tienes listas todavía"
            empty-subtitle="Haz clic en el botón + para crear una"
        />
    </div>

  <!-- Modal para crear nueva lista -->
  <CreateItemModal 
    :show="showCreateListModal"
    type="list"
    @close="showCreateListModal = false"
    @create="handleCreateList"
  />

    <!-- Modal para vista previa de lista (nuevo genérico) -->
    <PreviewItemsModal
        :show="store.isPreviewingList"
        :item-id="
            store.previewingListId
                ? parseInt(
                      store.previewingListId,
                  )
                : undefined
        "
        :item-name="
            shoppingLists.find(
                (l) =>
                    l.id ===
                    parseInt(
                        store.previewingListId ||
                            '0',
                    ),
            )?.name
        "
        type="list"
        @close="
            store.closePreviewListModal
        "
    />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal
        :show="showDeleteConfirm"
        title="Eliminar lista"
        message="¿Estás seguro de que quieres eliminar esta lista?"
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        variant="danger"
        @confirm="deleteList"
        @cancel="
            showDeleteConfirm = false
        "
    >
        <template #details>
            <p
                class="text-sm text-gray-600 mt-2"
            >
                Esta acción no se puede
                deshacer.
            </p>
        </template>
    </ConfirmationModal>

    <!-- Modal para compartir lista -->
    <BaseModal
        :show="showShareModal"
        title="Compartir Lista"
        max-width="md"
        @close="closeShareModal"
    >
        <div class="p-6">
            <div class="space-y-4">
                <!-- Mensaje de éxito -->
                <div
                    v-if="shareSuccess"
                    class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
                >
                    <svg
                        class="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <p
                        class="text-green-800 font-medium"
                    >
                        ¡Lista
                        compartida
                        exitosamente!
                    </p>
                </div>

                <!-- Formulario -->
                <div v-else>
                    <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email del
                        colaborador
                    </label>
                    <input
                        v-model="
                            shareEmail
                        "
                        type="email"
                        placeholder="ejemplo@email.com"
                        class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-verde-sidebar focus:outline-none transition-colors"
                        @keyup.enter="
                            shareList
                        "
                        :disabled="
                            isSharing
                        "
                    />

                    <!-- Mensaje de error -->
                    <p
                        v-if="
                            shareError
                        "
                        class="text-red-600 text-sm mt-2"
                    >
                        {{ shareError }}
                    </p>

                    <!-- Información -->
                    <div
                        class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4"
                    >
                        <p
                            class="text-sm text-blue-800"
                        >
                            💡 El
                            usuario
                            recibirá
                            acceso para
                            ver y editar
                            esta lista
                        </p>
                    </div>
                </div>

                <!-- Botones -->
                <div
                    class="flex gap-3 pt-4"
                >
                    <button
                        @click="
                            closeShareModal
                        "
                        :disabled="
                            isSharing
                        "
                        class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{
                            shareSuccess
                                ? "Cerrar"
                                : "Cancelar"
                        }}
                    </button>
                    <button
                        v-if="
                            !shareSuccess
                        "
                        @click="
                            shareList
                        "
                        :disabled="
                            !shareEmail.trim() ||
                            isSharing
                        "
                        class="flex-1 px-6 py-3 bg-verde-sidebar text-white font-semibold rounded-xl hover:bg-verde-contraste transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{
                            isSharing
                                ? "Compartiendo..."
                                : "Compartir"
                        }}
                    </button>
                </div>
            </div>
        </div>
    </BaseModal>
</template>
