import { computed, onMounted, ref } from "vue";
import { Pantry, PantryItem, type PantryData, type AddPantryItemData, type UpdatePantryItemData } from "@/api/pantry";
import { usePantryStore } from "@/stores/pantry";
import { useLog } from "./log";
import { useUser } from "./user";

export function usePantry() {
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const pantryStore = usePantryStore();

    async function createPantry(name: string, metadata = {}): Promise<Pantry | undefined> {
        const pantry: Partial<PantryData> = {
            name,
            metadata
        };

        try {
            const result = await pantryStore.add(pantry);
            log(result);
            return result;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function modifyPantry(id: number, updates: Partial<PantryData>): Promise<Pantry | undefined> {
        try {
            const pantry = await pantryStore.get(id);
            const updatedPantry = { ...pantry, ...updates };
            const result = await pantryStore.modify(updatedPantry);
            log(result);
            return result;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function deletePantry(id: number): Promise<boolean> {
        try {
            await pantryStore.remove(id);
            log(`Despensa ${id} eliminada`);
            return true;
        } catch (e) {
            error(e);
            return false;
        }
    }

    async function getAllPantries(options = {}): Promise<any> {
        try {
            const pantries = await pantryStore.getAll(undefined, options);
            log(pantryStore.pantries);
            return pantries;
        } catch (e) {
            error(e);
        }
    }

    async function getPantry(id: number): Promise<Pantry | undefined> {
        try {
            const result = await pantryStore.get(id);
            log(result);
            return result;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function addItemToPantry(pantryId: number, item: AddPantryItemData): Promise<PantryItem | undefined> {
        try {
            const result = await pantryStore.addItem(pantryId, item);
            log(result);
            return result;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function getPantryItems(pantryId: number, options = {}): Promise<any> {
        try {
            const items = await pantryStore.getItems(pantryId, undefined, options);
            log(pantryStore.pantryItems);
            return items;
        } catch (e) {
            error(e);
        }
    }

    async function updatePantryItem(pantryId: number, itemId: number, updates: UpdatePantryItemData): Promise<PantryItem | undefined> {
        try {
            const result = await pantryStore.updateItem(pantryId, itemId, updates);
            log(result);
            return result;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function deletePantryItem(pantryId: number, itemId: number): Promise<boolean> {
        try {
            await pantryStore.removeItem(pantryId, itemId);
            log(`Item ${itemId} eliminado de despensa ${pantryId}`);
            return true;
        } catch (e) {
            error(e);
            return false;
        }
    }

    async function sharePantry(pantryId: number, email: string): Promise<boolean> {
        try {
            await pantryStore.share(pantryId, email);
            log(`Despensa ${pantryId} compartida con ${email}`);
            return true;
        } catch (e) {
            error(e);
            return false;
        }
    }

    async function getSharedUsers(pantryId: number): Promise<any[] | undefined> {
        try {
            const users = await pantryStore.getSharedUsers(pantryId);
            log(users);
            return users;
        } catch (e) {
            error(e);
            return undefined;
        }
    }

    async function revokeShare(pantryId: number, userId: number): Promise<boolean> {
        try {
            await pantryStore.revokeShare(pantryId, userId);
            log(`Acceso revocado para usuario ${userId} en despensa ${pantryId}`);
            return true;
        } catch (e) {
            error(e);
            return false;
        }
    }

    async function goToPage(page: number): Promise<void> {
        try {
            const currentOptions = { page, limit: 10, orderBy: "name", order: "ASC" as const };
            await getAllPantries(currentOptions);
        } catch (e) {
            error(e);
        }
    }

    async function nextPage(): Promise<void> {
        if (pagination.value && pagination.value.has_next) {
            await goToPage(pagination.value.page + 1);
        }
    }

    async function prevPage(): Promise<void> {
        if (pagination.value && pagination.value.has_prev) {
            await goToPage(pagination.value.page - 1);
        }
    }

    async function goToItemsPage(pantryId: number, page: number): Promise<void> {
        try {
            const currentOptions = { page, limit: 50, orderBy: "createdAt", order: "DESC" as const };
            await getPantryItems(pantryId, currentOptions);
        } catch (e) {
            error(e);
        }
    }

    async function nextItemsPage(pantryId: number): Promise<void> {
        if (itemsPagination.value && itemsPagination.value.has_next) {
            await goToItemsPage(pantryId, itemsPagination.value.page + 1);
        }
    }

    async function prevItemsPage(pantryId: number): Promise<void> {
        if (itemsPagination.value && itemsPagination.value.has_prev) {
            await goToItemsPage(pantryId, itemsPagination.value.page - 1);
        }
    }

    const pantries = computed(() => {
        return pantryStore.pantries;
    });

    const pantryItems = computed(() => {
        return pantryStore.pantryItems;
    });

    const pagination = computed(() => {
        return pantryStore.pagination;
    });

    const itemsPagination = computed(() => {
        return pantryStore.itemsPagination;
    });

    onMounted(async () => {
        if (isLoggedIn.value) {
            await pantryStore.getAll(undefined, { page: 1, limit: 50, orderBy: "name", order: "ASC" });
        }
    });

    return {
        pantries,
        pantryItems,
        pagination,
        itemsPagination,
        createPantry,
        modifyPantry,
        deletePantry,
        getAllPantries,
        getPantry,
        addItemToPantry,
        getPantryItems,
        updatePantryItem,
        deletePantryItem,
        sharePantry,
        getSharedUsers,
        revokeShare,
        goToPage,
        nextPage,
        prevPage,
        goToItemsPage,
        nextItemsPage,
        prevItemsPage
    };
}
