import { Api } from "./api";

export interface CategoryData {
    id?: number;
    name: string;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryMetadataData {
    color?: string;
    [key: string]: any;
}

export interface GetAllCategoriesOptions {
    page?: number;
    per_page?: number;
    sort_by?: string;
    order?: "ASC" | "DESC";
    name?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
}

export class CategoryApi {
    static getUrl(slug?: string | number, query?: string): string {
        return `${Api.baseUrl}/categories${slug ? `/${slug}` : ""}${query ? `?${query}` : ""}`;
    }

    static async add(category: Partial<CategoryData>, controller?: AbortController): Promise<CategoryData> {
        return await Api.post<CategoryData>(CategoryApi.getUrl(), true, category, controller);
    }

    static async modify(category: CategoryData, controller?: AbortController): Promise<CategoryData> {
        return await Api.put<CategoryData>(CategoryApi.getUrl(category.id), true, category, controller);
    }

    static async remove(id: number, controller?: AbortController): Promise<void> {
        return await Api.delete<void>(CategoryApi.getUrl(id), true, controller);
    }

    static async get(id: number, controller?: AbortController): Promise<CategoryData> {
        return await Api.get<CategoryData>(CategoryApi.getUrl(id), true, controller);
    }

    static async getAll(
        controller?: AbortController,
        options: GetAllCategoriesOptions = {}
    ): Promise<PaginatedResponse<CategoryData>> {
        const { page = 1, per_page = 10, sort_by = "createdAt", order = "DESC", name } = options;
        let queryParams = `page=${page}&per_page=${per_page}&sort_by=${sort_by}&order=${order}`;
        if (name) {
            queryParams += `&name=${encodeURIComponent(name)}`;
        }
        return await Api.get<PaginatedResponse<CategoryData>>(CategoryApi.getUrl(undefined, queryParams), true, controller);
    }

    static async getByName(name: string, controller?: AbortController): Promise<PaginatedResponse<CategoryData>> {
        return await Api.get<PaginatedResponse<CategoryData>>(
            CategoryApi.getUrl(undefined, `name=${encodeURIComponent(name)}`),
            true,
            controller
        );
    }
}

export class Category {
    id?: number;
    name: string;
    metadata: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: CategoryData) {
        if (data.id) {
            this.id = data.id;
        }
        this.name = data.name;
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}

export class CategoryMetadata {
    color?: string;
    [key: string]: any;

    constructor(data: CategoryMetadataData = {}) {
        this.color = data.color;
        Object.keys(data).forEach((key) => {
            if (key !== "color") {
                this[key] = data[key];
            }
        });
    }
}
