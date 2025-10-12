import { ref } from "vue";
import { defineStore } from "pinia";
import { Purchase, PurchaseApi, type PurchaseData, type PaginatedResponse } from "@/api/purchase";

export const usePurchaseStore = defineStore("purchase", () => {
    const purchases = ref<Purchase[]>([]);
    const pagination = ref<any>(null);

    function mapPurchase(data: PurchaseData): Purchase {
        if (!data.id) return data as Purchase;

        return Object.assign(new Purchase(data), data);
    }

    async function getAll(controller?: AbortController, options = {}): Promise<PaginatedResponse<PurchaseData>> {
        const result = await PurchaseApi.getAll(controller, options);
        purchases.value = result.data.map((purchase) => mapPurchase(purchase));
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

    async function get(id: number): Promise<Purchase> {
        const result = await PurchaseApi.get(id);
        return mapPurchase(result);
    }

    async function restore(id: number): Promise<any> {
        return await PurchaseApi.restore(id);
    }

    function removePurchase(id: number): void {
        purchases.value = purchases.value.filter(p => p.id !== id);
    }

    return { purchases, pagination, getAll, get, restore, removePurchase };
});
