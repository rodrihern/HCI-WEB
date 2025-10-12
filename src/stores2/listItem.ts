import { ref } from "vue";
import { defineStore } from "pinia";
import { ListItem, ListItemApi, type ListItemData, type PaginatedResponse } from "@/api/listItem";

export const useListItemStore = defineStore("listItem", () => {
    const listItems = ref<ListItem[]>([]);
    const pagination = ref<any>(null);

    function mapListItem(data: ListItemData): ListItem {
        if (!data.id) return data as ListItem;

        return Object.assign(new ListItem(data), data);
    }

    async function add(listId: number, item: any): Promise<ListItem> {
        console.log('🔵 [listItemStore] Calling API to add item:', listId, item);
        const result = await ListItemApi.add(listId, item);
        console.log('✅ [listItemStore] API response:', result);
        await getAll(listId);
        return mapListItem(result);
    }

    async function getAll(listId: number, controller?: AbortController, options = {}): Promise<PaginatedResponse<ListItemData>> {
        const result = await ListItemApi.getAll(listId, controller, options);
        listItems.value = result.data.map((item) => mapListItem(item));
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

    async function update(listId: number, itemId: number, item: any): Promise<ListItem> {
        const result = await ListItemApi.update(listId, itemId, item);
        await getAll(listId);
        return mapListItem(result);
    }

    async function togglePurchased(listId: number, itemId: number, purchased: boolean): Promise<ListItem> {
        const result = await ListItemApi.togglePurchased(listId, itemId, purchased);
        await getAll(listId);
        return mapListItem(result);
    }

    async function remove(listId: number, itemId: number): Promise<void> {
        await ListItemApi.remove(listId, itemId);
        await getAll(listId);
    }

    return { listItems, pagination, add, getAll, update, togglePurchased, remove };
});
