import { Api } from "./api";
import type { UserData } from "./user";
import type { ShoppingListData } from "./shoppingList";
import type { ListItemData } from "./listItem";

export interface PurchaseData {
    id?: number;
    metadata?: Record<string, any>;
    owner: UserData;
    list: ShoppingListData;
    listItemArray: ListItemData[];
    createdAt?: string;
}

export interface GetAllPurchasesOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
    list_id?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export class PurchaseApi {
    static getUrl(slug?: string | number, query?: string): string {
        return `${Api.baseUrl}/purchases${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
    }

    static async getAll(
        controller?: AbortController,
        options: GetAllPurchasesOptions = {}
    ): Promise<PaginatedResponse<PurchaseData>> {
        const { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", list_id } = options;
        let queryParams = `page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
        if (list_id !== undefined) {
            queryParams += `&list_id=${list_id}`;
        }
        return await Api.get<PaginatedResponse<PurchaseData>>(PurchaseApi.getUrl(undefined, queryParams), true, controller);
    }

    static async get(id: number, controller?: AbortController): Promise<PurchaseData> {
        return await Api.get<PurchaseData>(PurchaseApi.getUrl(id), true, controller);
    }

    static async restore(id: number, controller?: AbortController): Promise<ShoppingListData> {
        return await Api.post<ShoppingListData>(PurchaseApi.getUrl(`${id}/restore`), true, undefined, controller);
    }
}

export class Purchase {
    id?: number;
    metadata: Record<string, any>;
    owner: UserData;
    list: ShoppingListData;
    listItemArray: ListItemData[];
    createdAt?: string;

    constructor(data: PurchaseData) {
        if (data.id) {
            this.id = data.id;
        }
        this.metadata = data.metadata || {};
        this.owner = data.owner;
        this.list = data.list;
        this.listItemArray = data.listItemArray;
        this.createdAt = data.createdAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}
