import { ref } from "vue";
import { defineStore } from "pinia";
import { Category, CategoryApi, CategoryMetadata, type CategoryData, type PaginatedResponse } from "@/api/category";

export const useCategoryStore = defineStore("category", () => {
    const categories = ref<Category[]>([]);
    const pagination = ref<any>(null);

    function mapCategory(data: CategoryData): Category {
        if (!data.id) return data as Category;

        const category = Object.assign(new Category(data), data);
        category.metadata = Object.assign(new CategoryMetadata(), data.metadata);
        return category;
    }

    async function add(category: Partial<CategoryData>): Promise<Category> {
        const result = await CategoryApi.add(category);
        await getAll();
        return mapCategory(result);
    }

    async function modify(category: CategoryData): Promise<Category> {
        const result = await CategoryApi.modify(category);
        await getAll();
        return mapCategory(result);
    }

    async function remove(id: number): Promise<void> {
        const result = await CategoryApi.remove(id);
        await getAll();
        return result;
    }

    async function get(id: number): Promise<Category> {
        const result = await CategoryApi.get(id);
        await getAll();
        return mapCategory(result);
    }

    async function getAll(controller?: AbortController, options = {}): Promise<PaginatedResponse<CategoryData>> {
        const result = await CategoryApi.getAll(controller, options);
        categories.value = result.data.map((category) => mapCategory(category));
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

    async function getByName(name: string): Promise<PaginatedResponse<CategoryData>> {
        const result = await CategoryApi.getByName(name);
        categories.value = result.data.map((category) => mapCategory(category));
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

    return { categories, pagination, add, modify, remove, get, getAll, getByName };
});
