import { computed, onMounted } from "vue";
import { Purchase } from "@/api/purchase";
import { usePurchaseStore } from "@/stores2/purchase";
import { useLog } from "./log";
import { useUser } from "./user";

export function usePurchase() {
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const purchaseStore = usePurchaseStore();

    async function getAllPurchases(options = {}): Promise<any> {
        try {
            const purchases = await purchaseStore.getAll(undefined, options);
            log(purchaseStore.purchases);
            return purchases;
        } catch (e) {
            error(e);
        }
    }

    async function getPurchase(id: number): Promise<void> {
        try {
            log(await purchaseStore.get(id));
        } catch (e) {
            error(e);
        }
    }

    async function restorePurchase(id: number): Promise<void> {
        try {
            log(await purchaseStore.restore(id));
        } catch (e) {
            error(e);
        }
    }

    async function goToPage(page: number): Promise<void> {
        try {
            const currentOptions = { page, limit: 10, orderBy: "createdAt", order: "DESC" as const };
            await getAllPurchases(currentOptions);
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

    const purchases = computed(() => {
        return purchaseStore.purchases;
    });

    const pagination = computed(() => {
        return purchaseStore.pagination;
    });

    onMounted(async () => {
        if (isLoggedIn.value) await purchaseStore.getAll();
    });

    return {
        purchases,
        pagination,
        getAllPurchases,
        getPurchase,
        restorePurchase,
        goToPage,
        nextPage,
        prevPage
    };
}
