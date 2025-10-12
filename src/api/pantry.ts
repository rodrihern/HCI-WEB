import { Api } from "./api";
import type { UserData } from "./user";
import type { ProductData } from "./product";

export interface PantryData {
    id?: number;
    name: string;
    metadata?: Record<string, any>;
    owner?: UserData;
    sharedWith?: UserData[];
    createdAt?: string;
    updatedAt?: string;
}

export interface PantryItemData {
    id?: number;
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
    product: ProductData;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetAllPantriesOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
    owner?: boolean;
}

export interface GetPantryItemsOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export interface AddPantryItemData {
    product: {
        id: number;
    };
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
}

export interface UpdatePantryItemData {
    quantity: number;
    unit: string;
    metadata?: Record<string, any>;
}

export class PantryApi {
    static getUrl(slug?: string | number, query?: string): string {
        return `${Api.baseUrl}/pantries${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
    }

    static async add(pantry: Partial<PantryData>, controller?: AbortController): Promise<PantryData> {
        return await Api.post<PantryData>(PantryApi.getUrl(), true, pantry, controller);
    }

    static async modify(pantry: PantryData, controller?: AbortController): Promise<PantryData> {
        return await Api.put<PantryData>(PantryApi.getUrl(pantry.id), true, pantry, controller);
    }

    static async remove(id: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(PantryApi.getUrl(id), true, controller);
    }

    static async get(id: number, controller?: AbortController): Promise<PantryData> {
        return await Api.get<PantryData>(PantryApi.getUrl(id), true, controller);
    }

    static async getAll(
        controller?: AbortController,
        options: GetAllPantriesOptions = {}
    ): Promise<PaginatedResponse<PantryData>> {
        const { page = 1, limit = 10, orderBy = "name", order = "ASC", owner } = options;
        let queryParams = `page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
        if (owner !== undefined) {
            queryParams += `&owner=${owner}`;
        }
        return await Api.get<PaginatedResponse<PantryData>>(PantryApi.getUrl(undefined, queryParams), true, controller);
    }

    static async share(id: number, email: string, controller?: AbortController): Promise<void> {
        return await Api.post<void>(PantryApi.getUrl(`${id}/share`), true, { email }, controller);
    }

    static async getSharedUsers(id: number, controller?: AbortController): Promise<UserData[]> {
        return await Api.get<UserData[]>(PantryApi.getUrl(`${id}/shared-users`), true, controller);
    }

    static async revokeShare(id: number, userId: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(PantryApi.getUrl(`${id}/share/${userId}`), true, controller);
    }

    // Pantry Items methods
    static async addItem(pantryId: number, item: AddPantryItemData, controller?: AbortController): Promise<PantryItemData> {
        return await Api.post<PantryItemData>(PantryApi.getUrl(`${pantryId}/items`), true, item, controller);
    }

    static async getItems(
        pantryId: number,
        controller?: AbortController,
        options: GetPantryItemsOptions = {}
    ): Promise<PaginatedResponse<PantryItemData>> {
        const { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search } = options;
        let queryParams = `page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
        if (search) {
            queryParams += `&search=${encodeURIComponent(search)}`;
        }
        return await Api.get<PaginatedResponse<PantryItemData>>(
            PantryApi.getUrl(`${pantryId}/items`, queryParams),
            true,
            controller
        );
    }

    static async updateItem(
        pantryId: number,
        itemId: number,
        item: UpdatePantryItemData,
        controller?: AbortController
    ): Promise<PantryItemData> {
        return await Api.put<PantryItemData>(PantryApi.getUrl(`${pantryId}/items/${itemId}`), true, item, controller);
    }

    static async removeItem(pantryId: number, itemId: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(PantryApi.getUrl(`${pantryId}/items/${itemId}`), true, controller);
    }
}

export class Pantry {
    id?: number;
    name: string;
    metadata: Record<string, any>;
    owner?: UserData;
    sharedWith?: UserData[];
    createdAt?: string;
    updatedAt?: string;

    constructor(data: PantryData) {
        if (data.id) {
            this.id = data.id;
        }
        this.name = data.name;
        this.metadata = data.metadata || {};
        this.owner = data.owner;
        this.sharedWith = data.sharedWith;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}

export class PantryItem {
    id?: number;
    quantity: number;
    unit: string;
    metadata: Record<string, any>;
    product: ProductData;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: PantryItemData) {
        if (data.id) {
            this.id = data.id;
        }
        this.quantity = data.quantity;
        this.unit = data.unit;
        this.metadata = data.metadata || {};
        this.product = data.product;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}
