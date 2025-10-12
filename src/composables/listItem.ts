import { computed } from "vue";
import { ListItem, type AddListItemData } from "@/api/listItem";
import { useListItemStore } from "@/stores2/listItem";
import { useLog } from "./log";

export function useListItem() {
    const { log, error } = useLog();
    const listItemStore = useListItemStore();

    async function addItemToList(listId: number, item: AddListItemData): Promise<void> {
        try {
            console.log('🔵 [useListItem] Adding item to list:', listId, item);
            const result = await listItemStore.add(listId, item);
            console.log('✅ [useListItem] Item added successfully:', result);
            log(result);
        } catch (e) {
            console.error('❌ [useListItem] Error adding item:', e);
            error(e);
            throw e;
        }
    }

    async function getListItems(listId: number, options = {}): Promise<any> {
        try {
            const items = await listItemStore.getAll(listId, undefined, options);
            log(listItemStore.listItems);
            return items;
        } catch (e) {
            error(e);
        }
    }

    async function updateListItem(listId: number, itemId: number, updates: any): Promise<void> {
        try {
            log(await listItemStore.update(listId, itemId, updates));
        } catch (e) {
            error(e);
        }
    }

    async function toggleItemPurchased(listId: number, itemId: number, purchased: boolean): Promise<void> {
        try {
            log(await listItemStore.togglePurchased(listId, itemId, purchased));
        } catch (e) {
            error(e);
        }
    }

    async function deleteListItem(listId: number, itemId: number): Promise<void> {
        try {
            log(await listItemStore.remove(listId, itemId));
        } catch (e) {
            error(e);
        }
    }

    const listItems = computed(() => {
        return listItemStore.listItems;
    });

    const pagination = computed(() => {
        return listItemStore.pagination;
    });

    return {
        listItems,
        pagination,
        addItemToList,
        getListItems,
        updateListItem,
        toggleItemPurchased,
        deleteListItem
    };
}
