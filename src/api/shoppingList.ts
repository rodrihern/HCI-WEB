import { Api } from "./api";
import type { UserData } from "./user";

export interface ShoppingListData {
    id?: number;
    name: string;
    description?: string;
    recurring?: boolean;
    metadata?: Record<string, any>;
    owner?: UserData;
    sharedWith?: UserData[];
    lastPurchasedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetAllShoppingListsOptions {
    page?: number;
    per_page?: number;
    sort_by?: string;
    order?: "ASC" | "DESC";
    name?: string;
    owner?: boolean;
    recurring?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export interface ShareListData {
    email: string;
}

export interface PurchaseMetadata {
    metadata?: Record<string, any>;
}

export class ShoppingListApi {
    static getUrl(slug?: string | number, query?: string): string {
        return `${Api.baseUrl}/shopping-lists${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
    }

    static async add(shoppingList: Partial<ShoppingListData>, controller?: AbortController): Promise<ShoppingListData> {
        return await Api.post<ShoppingListData>(ShoppingListApi.getUrl(), true, shoppingList, controller);
    }

    static async modify(shoppingList: ShoppingListData, controller?: AbortController): Promise<ShoppingListData> {
        return await Api.put<ShoppingListData>(ShoppingListApi.getUrl(shoppingList.id), true, shoppingList, controller);
    }

    static async remove(id: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(ShoppingListApi.getUrl(id), true, controller);
    }

    static async get(id: number, controller?: AbortController): Promise<ShoppingListData> {
        return await Api.get<ShoppingListData>(ShoppingListApi.getUrl(id), true, controller);
    }

    static async getAll(
        controller?: AbortController,
        options: GetAllShoppingListsOptions = {}
    ): Promise<PaginatedResponse<ShoppingListData>> {
        const { page = 1, per_page = 10, sort_by = "name", order = "ASC", name, owner, recurring } = options;
        let queryParams = `page=${page}&per_page=${per_page}&sort_by=${sort_by}&order=${order}`;
        if (name) {
            queryParams += `&name=${encodeURIComponent(name)}`;
        }
        if (owner !== undefined) {
            queryParams += `&owner=${owner}`;
        }
        if (recurring !== undefined) {
            queryParams += `&recurring=${recurring}`;
        }
        return await Api.get<PaginatedResponse<ShoppingListData>>(ShoppingListApi.getUrl(undefined, queryParams), true, controller);
    }

    static async purchase(id: number, metadata?: Record<string, any>, controller?: AbortController): Promise<void> {
        return await Api.post<void>(ShoppingListApi.getUrl(`${id}/purchase`), true, { metadata: metadata || {} }, controller);
    }

    static async reset(id: number, controller?: AbortController): Promise<void> {
        return await Api.post<void>(ShoppingListApi.getUrl(`${id}/reset`), true, undefined, controller);
    }


    static async share(id: number, email: string, controller?: AbortController): Promise<void> {
        return await Api.post<void>(ShoppingListApi.getUrl(`${id}/share`), true, { email }, controller);
    }

    static async getSharedUsers(id: number, controller?: AbortController): Promise<UserData[]> {
        return await Api.get<UserData[]>(ShoppingListApi.getUrl(`${id}/shared-users`), true, controller);
    }

    static async revokeShare(id: number, userId: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(ShoppingListApi.getUrl(`${id}/share/${userId}`), true, controller);
    }
}

export class ShoppingList {
    id?: number;
    name: string;
    description: string;
    recurring: boolean;
    metadata: Record<string, any>;
    owner?: UserData;
    sharedWith?: UserData[];
    lastPurchasedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: ShoppingListData) {
        if (data.id) {
            this.id = data.id;
        }
        this.name = data.name;
        this.description = data.description || "";
        this.recurring = data.recurring || false;
        this.metadata = data.metadata || {};
        this.owner = data.owner;
        this.sharedWith = data.sharedWith;
        this.lastPurchasedAt = data.lastPurchasedAt;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}
