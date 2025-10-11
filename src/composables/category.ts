import { ref, computed, onMounted } from "vue";
import { Category, CategoryMetadata, type CategoryData } from "@/api/category";
import { useCategoryStore } from "@/stores2/category";
import { useLog } from "./log";
import { useUser } from "./user";

export function useCategory() {
    const controller = ref<AbortController | null>(null);
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();
    const categoryStore = useCategoryStore();

    function getRandomColor(): string {
        return `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase()}`;
    }

    async function createCategory(): Promise<void> {
        const index = Math.floor(Math.random() * (999 - 1) + 1);
        const color = getRandomColor();
        const categoryMetadata = new CategoryMetadata({ color });
        const category: Partial<CategoryData> = { 
            name: `Category ${index}`, 
            metadata: categoryMetadata 
        };

        try {
            log(await categoryStore.add(category));
        } catch (e) {
            error(e);
        }
    }

    async function modifyCategory(id: number): Promise<void> {
        try {
            const category = await categoryStore.get(id);
            category.metadata.color = getRandomColor();
            log(await categoryStore.modify(category));
        } catch (e) {
            error(e);
        }
    }

    async function deleteCategory(id: number): Promise<void> {
        try {
            log(await categoryStore.remove(id));
        } catch (e) {
            error(e);
        }
    }

    async function getCategoriesByName(filter: string): Promise<void> {
        try {
            log(await categoryStore.getByName(filter));
        } catch (e) {
            error(e);
        }
    }

    async function getAllCategories(options = {}): Promise<void> {
        try {
            controller.value = new AbortController();
            const categories = await categoryStore.getAll(controller.value, options);
            controller.value = null;
            log(categories);
        } catch (e) {
            error(e);
        }
    }

    async function goToPage(page: number): Promise<void> {
        try {
            const currentOptions = { page, per_page: 10, sort_by: "createdAt", order: "DESC" as const };
            await getAllCategories(currentOptions);
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

    function abort(): void {
        controller.value?.abort();
    }

    const canAbort = computed(() => {
        return isLoggedIn && controller.value != null;
    });

    const categories = computed(() => {
        return categoryStore.categories;
    });

    const pagination = computed(() => {
        return categoryStore.pagination;
    });

    onMounted(async () => {
        if (isLoggedIn.value) await categoryStore.getAll();
    });

    return { 
        categories, 
        pagination, 
        createCategory, 
        modifyCategory, 
        deleteCategory, 
        getCategoriesByName, 
        getAllCategories, 
        goToPage, 
        nextPage, 
        prevPage, 
        abort, 
        canAbort 
    };
}
