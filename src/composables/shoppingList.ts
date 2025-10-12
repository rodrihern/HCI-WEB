import { computed, onMounted } from "vue";
import { ShoppingList, type ShoppingListData } from "@/api/shoppingList";
import { useShoppingListStore } from "@/stores/shoppingList";
import { useLog } from "./log";
import { useUser } from "./user";

export function useShoppingList() {
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const shoppingListStore = useShoppingListStore();

    async function createShoppingList(): Promise<void> {
        const index = Math.floor(Math.random() * (999 - 1) + 1);

        const shoppingList: Partial<ShoppingListData> = {
            name: `Shopping list ${index}`,
            description: "Shopping list description",
            recurring: false,
            metadata: {}
        };

        try {
            const result = await shoppingListStore.add(shoppingList);
            log(result);
        } catch (e) {
            error(e);
        }
    }

    async function modifyShoppingList(id: number): Promise<void> {
        try {
            const shoppingList = await shoppingListStore.get(id);
            shoppingList.recurring = !shoppingList.recurring;
            log(await shoppingListStore.modify(shoppingList));
        } catch (e) {
            error(e);
        }
    }

    async function deleteShoppingList(id: number): Promise<void> {
        try {
            log(await shoppingListStore.remove(id));
        } catch (e) {
            error(e);
        }
    }

    async function getAllShoppingLists(options = {}): Promise<any> {
        try {
            const shoppingLists = await shoppingListStore.getAll(undefined, options);
            log(shoppingListStore.shoppingLists);
            return shoppingLists;
        } catch (e) {
            error(e);
        }
    }

    async function goToPage(page: number): Promise<void> {
        try {
            const currentOptions = { page, per_page: 10, sort_by: "name", order: "ASC" as const };
            await getAllShoppingLists(currentOptions);
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

    const shoppingLists = computed(() => {
        return shoppingListStore.shoppingLists;
    });

    const pagination = computed(() => {
        return shoppingListStore.pagination;
    });

    onMounted(async () => {
        if (isLoggedIn.value) await shoppingListStore.getAll();
    });

    return { 
        shoppingLists, 
        pagination, 
        createShoppingList, 
        modifyShoppingList, 
        deleteShoppingList, 
        getAllShoppingLists, 
        goToPage, 
        nextPage, 
        prevPage 
    };
}
