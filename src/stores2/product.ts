import { ref } from "vue";
import { defineStore } from "pinia";
import { Product, ProductApi, type ProductData, type PaginatedResponse } from "@/api/product";

export const useProductStore = defineStore("product", () => {
    const products = ref<Product[]>([]);
    const pagination = ref<any>(null);

    function mapProduct(data: ProductData): Product {
        if (!data.id) return data as Product;

        return Object.assign(new Product(data), data);
    }

    async function add(product: Partial<ProductData>): Promise<Product> {
        const result = await ProductApi.add(product);
        await getAll();
        return mapProduct(result);
    }

    async function modify(product: ProductData): Promise<Product> {
        const result = await ProductApi.modify(product);
        await getAll();
        return mapProduct(result);
    }

    async function remove(id: number): Promise<void> {
        const result = await ProductApi.remove(id);
        await getAll();
        return result;
    }

    async function get(id: number): Promise<Product> {
        const result = await ProductApi.get(id);
        await getAll();
        return mapProduct(result);
    }

    async function getAll(controller?: AbortController, options = {}): Promise<PaginatedResponse<ProductData>> {
        const result = await ProductApi.getAll(controller, options);
        products.value = result.data.map((product) => mapProduct(product));
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

    return { products, pagination, add, modify, remove, get, getAll };
});
