import { Api } from "./api";
import type { CategoryData } from "./category";

export interface ProductData {
    id?: number;
    name: string;
    category_id?: number;
    pantry_id?: number | null;
    metadata?: Record<string, any>;
    category?: CategoryData;
    pantry?: any; // Will be defined in pantry.ts
    createdAt?: string;
    updatedAt?: string;
}

export interface GetAllProductsOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
    name?: string;
    category_id?: number;
    pantry_id?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export class ProductApi {
    static getUrl(slug?: string | number, query?: string): string {
        return `${Api.baseUrl}/products${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
    }

    static async add(product: Partial<ProductData>, controller?: AbortController): Promise<ProductData> {
        return await Api.post<ProductData>(ProductApi.getUrl(), true, product, controller);
    }

    static async modify(product: ProductData, controller?: AbortController): Promise<ProductData> {
        return await Api.put<ProductData>(ProductApi.getUrl(product.id), true, product, controller);
    }

    static async remove(id: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(ProductApi.getUrl(id), true, controller);
    }

    static async get(id: number, controller?: AbortController): Promise<ProductData> {
        return await Api.get<ProductData>(ProductApi.getUrl(id), true, controller);
    }

    static async getAll(
        controller?: AbortController,
        options: GetAllProductsOptions = {}
    ): Promise<PaginatedResponse<ProductData>> {
        const { page = 1, limit = 10, orderBy = "name", order = "ASC", name, category_id, pantry_id } = options;
        let queryParams = `page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`;
        if (name) {
            queryParams += `&name=${encodeURIComponent(name)}`;
        }
        if (category_id !== undefined) {
            queryParams += `&category_id=${category_id}`;
        }
        if (pantry_id !== undefined) {
            queryParams += `&pantry_id=${pantry_id}`;
        }
        return await Api.get<PaginatedResponse<ProductData>>(ProductApi.getUrl(undefined, queryParams), true, controller);
    }
}

export class Product {
    id?: number;
    name: string;
    category_id?: number;
    pantry_id?: number | null;
    metadata: Record<string, any>;
    category?: CategoryData;
    pantry?: any;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: ProductData) {
        if (data.id) {
            this.id = data.id;
        }
        this.name = data.name;
        this.category_id = data.category_id;
        this.pantry_id = data.pantry_id;
        this.metadata = data.metadata || {};
        this.category = data.category;
        this.pantry = data.pantry;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}

export class ProductMetadata {
    barcode?: string;
    [key: string]: any;

    constructor(data: Record<string, any> = {}) {
        this.barcode = data.barcode;
        Object.keys(data).forEach((key) => {
            if (key !== "barcode") {
                this[key] = data[key];
            }
        });
    }
}
