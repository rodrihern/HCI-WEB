import { ref } from "vue";
import { defineStore } from "pinia";
import { ShoppingList, ShoppingListApi, type ShoppingListData, type PaginatedResponse } from "@/api/shoppingList";

export const useShoppingListStore = defineStore("shoppingList", () => {
    const shoppingLists = ref<ShoppingList[]>([]);
    const pagination = ref<any>(null);

    function mapShoppingList(data: ShoppingListData): ShoppingList {
        if (!data.id) return data as ShoppingList;

        return Object.assign(new ShoppingList(data), data);
    }

    async function add(shoppingList: Partial<ShoppingListData>): Promise<ShoppingList> {
        const result = await ShoppingListApi.add(shoppingList);
        await getAll();
        return mapShoppingList(result);
    }

    async function modify(shoppingList: ShoppingListData): Promise<ShoppingList> {
        const result = await ShoppingListApi.modify(shoppingList);
        await getAll();
        return mapShoppingList(result);
    }

    async function remove(id: number): Promise<void> {
        const result = await ShoppingListApi.remove(id);
        await getAll();
        return result;
    }

    async function get(id: number): Promise<ShoppingList> {
        const result = await ShoppingListApi.get(id);
        await getAll();
        return mapShoppingList(result);
    }

    async function getAll(controller?: AbortController, options = {}): Promise<PaginatedResponse<ShoppingListData>> {
        const result = await ShoppingListApi.getAll(controller, options);
        shoppingLists.value = result.data.map((shoppingList) => mapShoppingList(shoppingList));
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


    return { shoppingLists, pagination, add, modify, remove, get, getAll };
});
