# Pinia Stores y Composables - TypeScript

Esta carpeta contiene los stores de Pinia en TypeScript para gestionar el estado global de la aplicación.

## Estructura

### Stores (`/stores2`)

Los stores gestionan el estado y la lógica de negocio de la aplicación usando Pinia.

- **`user.ts`** - Autenticación y perfil de usuario
- **`category.ts`** - Categorías de productos
- **`product.ts`** - Productos
- **`shoppingList.ts`** - Listas de compras
- **`listItem.ts`** - Items de listas
- **`pantry.ts`** - Despensas y sus items
- **`purchase.ts`** - Historial de compras

### Composables (`/composables`)

Los composables son funciones reutilizables que encapsulan lógica y proporcionan una interfaz simple para los componentes.

- **`log.ts`** - Utilidades de logging
- **`user.ts`** - Composable para autenticación
- **`category.ts`** - Composable para categorías
- **`product.ts`** - Composable para productos
- **`shoppingList.ts`** - Composable para listas
- **`listItem.ts`** - Composable para items de lista
- **`pantry.ts`** - Composable para despensas
- **`purchase.ts`** - Composable para historial

## Patrón de Uso

### 1. Store (Estado Global)

Los stores se encargan de:
- Almacenar el estado reactivo
- Hacer llamadas a la API
- Mapear las respuestas a modelos
- Mantener la paginación

```typescript
// stores2/category.ts
export const useCategoryStore = defineStore("category", () => {
    const categories = ref<Category[]>([]);
    const pagination = ref<any>(null);

    async function getAll(controller?: AbortController, options = {}) {
        const result = await CategoryApi.getAll(controller, options);
        categories.value = result.data.map((category) => mapCategory(category));
        pagination.value = { /* ... */ };
        return result;
    }

    return { categories, pagination, getAll, /* ... */ };
});
```

### 2. Composable (Lógica de Componente)

Los composables se encargan de:
- Usar el store correspondiente
- Proporcionar métodos convenientes
- Manejar errores y logging
- Exponer computed properties

```typescript
// composables/category.ts
export function useCategory() {
    const categoryStore = useCategoryStore();
    const { log, error } = useLog();
    const { isLoggedIn } = useUser();

    async function createCategory() {
        try {
            log(await categoryStore.add(category));
        } catch (e) {
            error(e);
        }
    }

    const categories = computed(() => categoryStore.categories);

    return { categories, createCategory, /* ... */ };
}
```

### 3. Componente (UI)

Los componentes usan los composables:

```vue
<script setup lang="ts">
import { useCategory } from '@/composables';

const { 
    categories, 
    createCategory, 
    deleteCategory,
    pagination 
} = useCategory();
</script>

<template>
    <button @click="createCategory()">Create</button>
    <div v-for="category in categories" :key="category.id">
        {{ category.name }}
    </div>
</template>
```

## Ejemplos de Uso

### User Authentication

```typescript
import { useUser } from '@/composables';

const { user, isLoggedIn, login, logout, getProfile } = useUser();

// Login
await login('user@email.com', 'password');

// Obtener perfil
await getProfile();
console.log(user.value); // User object

// Logout
await logout();
```

### Categorías

```typescript
import { useCategory } from '@/composables';

const { 
    categories, 
    pagination,
    createCategory, 
    modifyCategory,
    deleteCategory,
    getAllCategories,
    getCategoriesByName,
    nextPage,
    prevPage
} = useCategory();

// Crear categoría
await createCategory();

// Obtener todas con opciones
await getAllCategories({ 
    page: 1, 
    per_page: 20, 
    sort_by: 'name', 
    order: 'ASC' 
});

// Buscar por nombre
await getCategoriesByName('Lácteos');

// Modificar
await modifyCategory(1);

// Eliminar
await deleteCategory(1);

// Paginación
await nextPage();
await prevPage();
```

### Shopping Lists

```typescript
import { useShoppingList } from '@/composables';

const { 
    shoppingLists, 
    pagination,
    createShoppingList,
    modifyShoppingList,
    deleteShoppingList,
    getAllShoppingLists
} = useShoppingList();

// Crear lista
await createShoppingList();

// Obtener todas
await getAllShoppingLists({ recurring: true });

// Toggle recurring
await modifyShoppingList(1);

// Eliminar
await deleteShoppingList(1);
```

### Products

```typescript
import { useProduct } from '@/composables';

const { 
    products, 
    createProduct,
    modifyProduct,
    deleteProduct,
    getAllProducts
} = useProduct();

// Crear producto
await createProduct('Leche', 1, null); // name, categoryId, pantryId

// Modificar
await modifyProduct(1, { name: 'Leche Entera' });

// Eliminar
await deleteProduct(1);
```

### Pantries

```typescript
import { usePantry } from '@/composables';

const { 
    pantries,
    pantryItems,
    createPantry,
    addItemToPantry,
    getPantryItems,
    updatePantryItem,
    deletePantryItem
} = usePantry();

// Crear despensa
await createPantry('Heladera', { color: 'blue' });

// Agregar item
await addItemToPantry(1, {
    product: {
        id: 5
    },
    quantity: 2,
    unit: 'kg',
    metadata: {}
});

// Obtener items
await getPantryItems(1);

// Actualizar item
await updatePantryItem(1, 10, { quantity: 3 });

// Eliminar item
await deletePantryItem(1, 10);
```

### List Items

```typescript
import { useListItem } from '@/composables';

const { 
    listItems,
    addItemToList,
    getListItems,
    updateListItem,
    toggleItemPurchased,
    deleteListItem
} = useListItem();

// Agregar item a lista
await addItemToList(1, {
    product: {
        id: 5
    },
    quantity: 2,
    unit: 'kg',
    metadata: {}
});

// Obtener items de lista
await getListItems(1, { purchased: false });

// Toggle purchased
await toggleItemPurchased(1, 10, true);

// Actualizar
await updateListItem(1, 10, { quantity: 3 });

// Eliminar
await deleteListItem(1, 10);
```

### Purchases (Historial)

```typescript
import { usePurchase } from '@/composables';

const { 
    purchases,
    getAllPurchases,
    getPurchase,
    restorePurchase
} = usePurchase();

// Obtener historial
await getAllPurchases({ list_id: 1 });

// Obtener compra específica
await getPurchase(15);

// Restaurar compra (crear nueva lista)
await restorePurchase(15);
```

## Ventajas de este Patrón

1. **Separación de Responsabilidades**: 
   - Stores = Estado y API
   - Composables = Lógica de UI y manejo de errores
   - Componentes = Presentación

2. **Reutilización**: Los composables pueden usarse en múltiples componentes

3. **Testing**: Más fácil probar stores y composables por separado

4. **Type Safety**: TypeScript proporciona autocompletado y validación

5. **Mantenibilidad**: Código organizado y predecible

## Logging y Error Handling

Todos los composables usan `useLog()` para logging consistente:

```typescript
const { log, error } = useLog();

try {
    const result = await someApiCall();
    log(result); // JSON.stringify con formato
} catch (e) {
    error(e); // console.error
}
```

## Paginación

Todos los stores que soportan paginación exponen:

```typescript
const pagination = {
    page: 1,
    per_page: 10,
    total: 50,
    total_pages: 5,
    has_next: true,
    has_prev: false
};
```

Los composables proporcionan métodos:
- `nextPage()` - Ir a la siguiente página
- `prevPage()` - Ir a la página anterior
- `goToPage(n)` - Ir a página específica

## Importaciones Centralizadas

Usa los archivos index para importaciones limpias:

```typescript
// En lugar de:
import { useCategory } from '@/composables/category';
import { useProduct } from '@/composables/product';

// Usa:
import { useCategory, useProduct } from '@/composables';
```

## Migración desde Mock Data

Para migrar componentes que usan mock data:

1. Reemplaza imports de mock data con composables
2. Usa los métodos del composable en lugar de manipular arrays
3. Remueve lógica de paginación manual (usa la del composable)
4. Asegúrate de que `isLoggedIn` esté disponible donde se necesite

Ejemplo:
```vue
<!-- Antes (con mock data) -->
<script setup>
import { ref } from 'vue';
const categories = ref([/* mock data */]);
</script>

<!-- Después (con composable) -->
<script setup lang="ts">
import { useCategory } from '@/composables';
const { categories, createCategory } = useCategory();
</script>
```
