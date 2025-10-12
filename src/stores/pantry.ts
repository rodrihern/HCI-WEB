import { ref } from "vue";
import { defineStore } from "pinia";
import { Pantry, PantryItem, PantryApi, type PantryData, type PantryItemData, type PaginatedResponse } from "@/api/pantry";

export const usePantryStore = defineStore("pantry", () => {
    const pantries = ref<Pantry[]>([]);
    const pantryItems = ref<PantryItem[]>([]);
    const pagination = ref<any>(null);
    const itemsPagination = ref<any>(null);

    function mapPantry(data: PantryData): Pantry {
        if (!data.id) return data as Pantry;

        return Object.assign(new Pantry(data), data);
    }

    function mapPantryItem(data: PantryItemData): PantryItem {
        if (!data.id) return data as PantryItem;

        return Object.assign(new PantryItem(data), data);
    }

    async function add(pantry: Partial<PantryData>): Promise<Pantry> {
        const result = await PantryApi.add(pantry);
        await getAll();
        return mapPantry(result);
    }

    async function modify(pantry: PantryData): Promise<Pantry> {
        const result = await PantryApi.modify(pantry);
        await getAll();
        return mapPantry(result);
    }

    async function remove(id: number): Promise<void> {
        const result = await PantryApi.remove(id);
        await getAll();
        return result;
    }

    async function get(id: number): Promise<Pantry> {
        const result = await PantryApi.get(id);
        await getAll();
        return mapPantry(result);
    }

    async function getAll(controller?: AbortController, options = {}): Promise<PaginatedResponse<PantryData>> {
        const result = await PantryApi.getAll(controller, options);
        pantries.value = result.data.map((pantry) => mapPantry(pantry));
        pagination.value = {
            page: result.page,
            per_page: result.per_page,
            total: result.total,
            total_pages: result.totalPages,
            has_next: result.page < result.totalPages,
            has_prev: result.page > 1
        };
        return result;
    }

    // Pantry Items methods
    async function addItem(pantryId: number, item: any): Promise<PantryItem> {
        const result = await PantryApi.addItem(pantryId, item);
        await getItems(pantryId);
        return mapPantryItem(result);
    }

    async function getItems(pantryId: number, controller?: AbortController, options = {}): Promise<PaginatedResponse<PantryItemData>> {
        const result = await PantryApi.getItems(pantryId, controller, options);
        pantryItems.value = result.data.map((item) => mapPantryItem(item));
        itemsPagination.value = {
            page: result.page,
            per_page: result.per_page,
            total: result.total,
            total_pages: result.totalPages,
            has_next: result.page < result.totalPages,
            has_prev: result.page > 1
        };
        return result;
    }

    async function updateItem(pantryId: number, itemId: number, item: any): Promise<PantryItem> {
        const result = await PantryApi.updateItem(pantryId, itemId, item);
        await getItems(pantryId);
        return mapPantryItem(result);
    }

    async function removeItem(pantryId: number, itemId: number): Promise<void> {
        await PantryApi.removeItem(pantryId, itemId);
        await getItems(pantryId);
    }

    async function share(pantryId: number, email: string): Promise<void> {
        await PantryApi.share(pantryId, email);
    }

    async function getSharedUsers(pantryId: number): Promise<any[]> {
        const users = await PantryApi.getSharedUsers(pantryId);
        return users;
    }

    async function revokeShare(pantryId: number, userId: number): Promise<void> {
        await PantryApi.revokeShare(pantryId, userId);
    }

    return { 
        pantries, 
        pantryItems, 
        pagination, 
        itemsPagination, 
        add, 
        modify, 
        remove, 
        get, 
        getAll,
        addItem,
        getItems,
        updateItem,
        removeItem,
        share,
        getSharedUsers,
        revokeShare
    };
});
