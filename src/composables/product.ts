import {
  computed,
  onMounted,
} from "vue";
import {
  Product,
  type ProductData,
} from "@/api/product";
import { useProductStore } from "@/stores/product";
import { useLog } from "./log";
import { useUser } from "./user";

export function useProduct() {
  const { log, error } = useLog();
  const { isLoggedIn } = useUser();
  const productStore =
    useProductStore();

  async function createProduct(
    name: string,
    categoryId?: number,
    pantryId?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Construir el payload en el formato que espera el backend
    const payload: any = {
      name,
      metadata: metadata || {},
    };

    // El backend espera category como objeto { id: number }
    if (categoryId !== undefined) {
      payload.category = {
        id: categoryId,
      };
    }

    // El backend espera pantry como objeto { id: number }
    if (pantryId !== undefined) {
      payload.pantry = { id: pantryId };
    }

    try {
      const result =
        await productStore.add(payload);
      log(result);
    } catch (e: any) {
      error(e);
      throw e;
    }
  }

  async function modifyProduct(
    id: number,
    updates: Partial<ProductData>,
  ): Promise<void> {
    try {
      const product =
        await productStore.get(id);

      // Construir el payload en el formato que espera el backend
      const payload: any = {
        name:
          updates.name || product.name,
        metadata:
          updates.metadata ||
          product.metadata ||
          {},
      };

      // El backend espera category como objeto { id: number }
      if (
        updates.category_id !==
        undefined
      ) {
        payload.category = {
          id: updates.category_id,
        };
      } else if (
        product.category_id !==
        undefined
      ) {
        payload.category = {
          id: product.category_id,
        };
      }

      // El backend espera pantry como objeto { id: number }
      if (
        updates.pantry_id !== undefined
      ) {
        payload.pantry = {
          id: updates.pantry_id,
        };
      } else if (
        product.pantry_id !== undefined
      ) {
        payload.pantry = {
          id: product.pantry_id,
        };
      }

      // Necesitamos el id para el modify
      const productToModify = {
        ...product,
        ...payload,
        id: id,
      };

      log(
        await productStore.modify(
          productToModify,
        ),
      );
    } catch (e) {
      error(e);
    }
  }

  async function deleteProduct(
    id: number,
  ): Promise<void> {
    try {
      log(
        await productStore.remove(id),
      );
    } catch (e) {
      error(e);
    }
  }

  async function getAllProducts(
    options = {},
  ): Promise<any> {
    try {
      const products =
        await productStore.getAll(
          undefined,
          options,
        );
      log(productStore.products);
      return products;
    } catch (e) {
      error(e);
    }
  }

  async function goToPage(
    page: number,
  ): Promise<void> {
    try {
      const currentOptions = {
        page,
        limit: 10,
        orderBy: "name",
        order: "ASC" as const,
      };
      await getAllProducts(
        currentOptions,
      );
    } catch (e) {
      error(e);
    }
  }

  async function nextPage(): Promise<void> {
    if (
      pagination.value &&
      pagination.value.has_next
    ) {
      await goToPage(
        pagination.value.page + 1,
      );
    }
  }

  async function prevPage(): Promise<void> {
    if (
      pagination.value &&
      pagination.value.has_prev
    ) {
      await goToPage(
        pagination.value.page - 1,
      );
    }
  }

  const products = computed(() => {
    return productStore.products;
  });

  const pagination = computed(() => {
    return productStore.pagination;
  });

  onMounted(async () => {
    if (isLoggedIn.value)
      await productStore.getAll(
        undefined,
        { limit: 100 },
      );
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
    prevPage,
  };
}
