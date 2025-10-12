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
import ShareModal from '@/components/ShareModal.vue'
import ListItem from '@/components/ListItem.vue'
import ContextMenu from '@/components/ContextMenu.vue'
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
const listToShare = ref<{
    id: number;
    name: string;
} | null>(null);

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
    const list = shoppingLists.value.find(l => l.id === listId);
    
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
                onClick: () => {
                    if (list) openShareModal(list);
                },
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
const openShareModal = (list: ShoppingListData) => {
    if (list.id && list.name) {
        listToShare.value = {
            id: list.id,
            name: list.name
        };
        showShareModal.value = true;
    }
};

const closeShareModal = () => {
    showShareModal.value = false;
    listToShare.value = null;
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
                    <template #actions="{ onMenuStateChange }">
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
                                    @menu-state-change="onMenuStateChange"
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
    <ShareModal
        type="list"
        :show="showShareModal"
        :item-id="listToShare?.id"
        :item-name="listToShare?.name"
        @close="closeShareModal"
        @shared="() => {}"
    />
</template>
