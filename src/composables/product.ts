import { computed, onMounted } from "vue";
import { Product, type ProductData } from "@/api/product";
import { useProductStore } from "@/stores2/product";
import { useLog } from "./log";
import { useUser } from "./user";

export function useProduct() {
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const productStore = useProductStore();

    async function createProduct(name: string, categoryId?: number, pantryId?: number): Promise<void> {
        const product: Partial<ProductData> = {
            name,
            category_id: categoryId,
            pantry_id: pantryId,
            metadata: {}
        };

        try {
            log(await productStore.add(product));
        } catch (e) {
            error(e);
        }
    }

    async function modifyProduct(id: number, updates: Partial<ProductData>): Promise<void> {
        try {
            const product = await productStore.get(id);
            const updatedProduct = { ...product, ...updates };
            log(await productStore.modify(updatedProduct));
        } catch (e) {
            error(e);
        }
    }

    async function deleteProduct(id: number): Promise<void> {
        try {
            log(await productStore.remove(id));
        } catch (e) {
            error(e);
        }
    }

    async function getAllProducts(options = {}): Promise<any> {
        try {
            const products = await productStore.getAll(undefined, options);
            log(productStore.products);
            return products;
        } catch (e) {
            error(e);
        }
    }

    async function goToPage(page: number): Promise<void> {
        try {
            const currentOptions = { page, limit: 10, orderBy: "name", order: "ASC" as const };
            await getAllProducts(currentOptions);
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

    const products = computed(() => {
        return productStore.products;
    });

    const pagination = computed(() => {
        return productStore.pagination;
    });

    onMounted(async () => {
        if (isLoggedIn.value) await productStore.getAll();
    });

    return {
        products,
        pagination,
        createProduct,
        modifyProduct,
        deleteProduct,
        getAllProducts,
        goToPage,
        nextPage,
        prevPage
    };
}
