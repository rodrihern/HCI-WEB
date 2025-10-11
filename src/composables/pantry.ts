import { computed, onMounted } from "vue";
import { Pantry, PantryItem, type PantryData, type AddPantryItemData } from "@/api/pantry";
import { usePantryStore } from "@/stores2/pantry";
import { useLog } from "./log";
import { useUser } from "./user";

export function usePantry() {
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const pantryStore = usePantryStore();

    async function createPantry(name: string, metadata = {}): Promise<void> {
        const pantry: Partial<PantryData> = {
            name,
            metadata
        };

        try {
            log(await pantryStore.add(pantry));
        } catch (e) {
            error(e);
        }
    }

    async function modifyPantry(id: number, updates: Partial<PantryData>): Promise<void> {
        try {
            const pantry = await pantryStore.get(id);
            const updatedPantry = { ...pantry, ...updates };
            log(await pantryStore.modify(updatedPantry));
        } catch (e) {
            error(e);
        }
    }

    async function deletePantry(id: number): Promise<void> {
        try {
            log(await pantryStore.remove(id));
        } catch (e) {
            error(e);
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

    async function addItemToPantry(pantryId: number, item: AddPantryItemData): Promise<void> {
        try {
            log(await pantryStore.addItem(pantryId, item));
        } catch (e) {
            error(e);
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

    async function updatePantryItem(pantryId: number, itemId: number, updates: any): Promise<void> {
        try {
            log(await pantryStore.updateItem(pantryId, itemId, updates));
        } catch (e) {
            error(e);
        }
    }

    async function deletePantryItem(pantryId: number, itemId: number): Promise<void> {
        try {
            log(await pantryStore.removeItem(pantryId, itemId));
        } catch (e) {
            error(e);
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
        if (isLoggedIn.value) await pantryStore.getAll();
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
        addItemToPantry,
        getPantryItems,
        updatePantryItem,
        deletePantryItem,
        goToPage,
        nextPage,
        prevPage
    };
}
