import { Api } from "./api";
import type { ProductData } from "./product";

export interface ListItemData {
    id?: number;
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
    purchased: boolean;
    lastPurchasedAt?: string | null;
    product: ProductData;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddListItemData {
    product_id: number;
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
}

export interface UpdateListItemData {
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
}

export interface TogglePurchasedData {
    purchased: boolean;
}

export interface GetListItemsOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
    purchased?: boolean;
    pantry_id?: number;
    category_id?: number;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export class ListItemApi {
    static getUrl(listId: number, itemId?: number, query?: string): string {
        const base = `${Api.baseUrl}/shopping-lists/${listId}/items`;
        return `${base}${itemId ? `/${itemId}` : ""}${query ? `?${query}` : ""}`;
    }

    static async add(listId: number, item: AddListItemData, controller?: AbortController): Promise<ListItemData> {
        return await Api.post<ListItemData>(ListItemApi.getUrl(listId), true, item, controller);
    }

    static async getAll(
        listId: number,
        controller?: AbortController,
        options: GetListItemsOptions = {}
    ): Promise<PaginatedResponse<ListItemData>> {
        const { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", purchased, pantry_id, category_id, search } = options;
        let queryParams = `page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
        if (purchased !== undefined) {
            queryParams += `&purchased=${purchased}`;
        }
        if (pantry_id !== undefined) {
            queryParams += `&pantry_id=${pantry_id}`;
        }
        if (category_id !== undefined) {
            queryParams += `&category_id=${category_id}`;
        }
        if (search) {
            queryParams += `&search=${encodeURIComponent(search)}`;
        }
        return await Api.get<PaginatedResponse<ListItemData>>(ListItemApi.getUrl(listId, undefined, queryParams), true, controller);
    }

    static async update(
        listId: number,
        itemId: number,
        item: UpdateListItemData,
        controller?: AbortController
    ): Promise<ListItemData> {
        return await Api.put<ListItemData>(ListItemApi.getUrl(listId, itemId), true, item, controller);
    }

    static async togglePurchased(
        listId: number,
        itemId: number,
        purchased: boolean,
        controller?: AbortController
    ): Promise<ListItemData> {
        return await Api.patch<ListItemData>(ListItemApi.getUrl(listId, itemId), true, { purchased }, controller);
    }

    static async remove(listId: number, itemId: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(ListItemApi.getUrl(listId, itemId), true, controller);
    }
}

export class ListItem {
    id?: number;
    quantity: number;
    unit: string;
    metadata: Record<string, any>;
    purchased: boolean;
    lastPurchasedAt?: string | null;
    product: ProductData;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: ListItemData) {
        if (data.id) {
            this.id = data.id;
        }
        this.quantity = data.quantity;
        this.unit = data.unit;
        this.metadata = data.metadata || {};
        this.purchased = data.purchased;
        this.lastPurchasedAt = data.lastPurchasedAt;
        this.product = data.product;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}
