# API Wrappers - TypeScript

Este directorio contiene wrappers en TypeScript para todos los endpoints de la API del HCI Grocery Manager.

## Estructura

- **`api.ts`**: Clase base `Api` con métodos HTTP (GET, POST, PUT, DELETE, PATCH)
- **`user.ts`**: Autenticación y gestión de usuarios
- **`category.ts`**: Categorías de productos
- **`product.ts`**: Productos
- **`shoppingList.ts`**: Listas de compras
- **`listItem.ts`**: Items de listas de compras
- **`pantry.ts`**: Despensas y sus items
- **`purchase.ts`**: Historial de compras
- **`index.ts`**: Exportaciones centralizadas

## Instalación y Configuración

### 1. Configurar el token de autenticación

```typescript
import { Api } from '@/api';

// Después de hacer login, guardar el token
const response = await UserApi.login({ email, password });
Api.token = response.token;
```

### 2. Usar los wrappers

```typescript
import { UserApi, CategoryApi, ProductApi, ShoppingListApi } from '@/api';
```

## Ejemplos de Uso

### Autenticación

```typescript
import { UserApi, Api, type LoginResponse } from '@/api';

// Registro
await UserApi.register({
  name: 'Juan',
  surname: 'Pérez',
  email: 'juan@email.com',
  password: '123456'
});

// Login
const loginResponse: LoginResponse = await UserApi.login({
  email: 'juan@email.com',
  password: '123456'
});

// Guardar token
Api.token = loginResponse.token;

// Obtener perfil
const profile = await UserApi.getProfile();
console.log(profile.name); // Juan

// Actualizar perfil
await UserApi.updateProfile({
  name: 'Juan Carlos',
  surname: 'Pérez García'
});

// Cambiar contraseña
await UserApi.changePassword({
  currentPassword: '123456',
  newPassword: 'nueva_password'
});

// Logout
await UserApi.logout();
Api.token = null;
```

### Categorías

```typescript
import { CategoryApi, Category, type CategoryData } from '@/api';

// Crear categoría
const newCategory = await CategoryApi.add({
  name: 'Lácteos',
  metadata: { color: '#FFE5E5' }
});

// Listar todas las categorías con paginación
const categories = await CategoryApi.getAll(undefined, {
  page: 1,
  per_page: 20,
  sort_by: 'name',
  order: 'ASC'
});

console.log(categories.data); // Array de categorías
console.log(categories.total); // Total de categorías

// Buscar por nombre
const dairy = await CategoryApi.getByName('Lácteos');

// Obtener categoría específica
const category = await CategoryApi.get(1);

// Actualizar
await CategoryApi.modify({
  id: 1,
  name: 'Lácteos y Huevos',
  metadata: { color: '#FFE5E5' }
});

// Eliminar
await CategoryApi.remove(1);
```

### Productos

```typescript
import { ProductApi, type ProductData } from '@/api';

// Crear producto
const newProduct = await ProductApi.add({
  name: 'Leche Entera',
  category_id: 1,
  pantry_id: null,
  metadata: { barcode: '7790001234567' }
});

// Listar productos con filtros
const products = await ProductApi.getAll(undefined, {
  page: 1,
  limit: 10,
  name: 'leche',
  category_id: 1
});

// Obtener producto
const product = await ProductApi.get(1);

// Actualizar
await ProductApi.modify({
  id: 1,
  name: 'Leche Entera 1L',
  category_id: 1,
  pantry_id: 4
});

// Eliminar
await ProductApi.remove(1);
```

### Listas de Compras

```typescript
import { ShoppingListApi, type ShoppingListData } from '@/api';

// Crear lista
const newList = await ShoppingListApi.add({
  name: 'Supermercado Mensual',
  description: 'Compras del mes',
  recurring: true,
  metadata: {}
});

// Listar listas
const lists = await ShoppingListApi.getAll(undefined, {
  page: 1,
  per_page: 10,
  owner: true, // Solo mis listas
  recurring: true // Solo listas recurrentes
});

// Obtener lista específica
const list = await ShoppingListApi.get(1);

// Actualizar
await ShoppingListApi.modify({
  id: 1,
  name: 'Supermercado Semanal',
  description: 'Compras semanales',
  recurring: false
});

// Compartir lista
await ShoppingListApi.share(1, 'amigo@email.com');

// Ver usuarios con acceso
const sharedUsers = await ShoppingListApi.getSharedUsers(1);

// Revocar acceso
await ShoppingListApi.revokeShare(1, 5); // 5 = userId

// Marcar como comprada (genera historial)
await ShoppingListApi.purchase(1, { notes: 'Comprado en Carrefour' });

// Resetear items (marcar todos como no comprados)
await ShoppingListApi.reset(1);

// Mover items comprados a despensa
await ShoppingListApi.moveToPantry(1);

// Eliminar
await ShoppingListApi.remove(1);
```

### Items de Lista

```typescript
import { ListItemApi, type ListItemData } from '@/api';

// Agregar item a lista
const newItem = await ListItemApi.add(1, {
  product: {
    id: 10
  },
  quantity: 2,
  unit: 'kg',
  metadata: {}
});

// Listar items de una lista
const items = await ListItemApi.getAll(1, undefined, {
  page: 1,
  limit: 10,
  purchased: false, // Solo no comprados
  category_id: 1,
  search: 'leche'
});

// Actualizar item
await ListItemApi.update(1, 5, {
  quantity: 3,
  unit: 'litros',
  metadata: {}
});

// Marcar como comprado/no comprado
await ListItemApi.togglePurchased(1, 5, true);

// Eliminar item
await ListItemApi.remove(1, 5);
```

### Despensas

```typescript
import { PantryApi, type PantryData, type PantryItemData } from '@/api';

// Crear despensa
const newPantry = await PantryApi.add({
  name: 'Heladera',
  metadata: { color: 'blue', location: 'cocina' }
});

// Listar despensas
const pantries = await PantryApi.getAll(undefined, {
  page: 1,
  limit: 10,
  owner: true
});

// Obtener despensa con items
const pantry = await PantryApi.get(1);

// Actualizar
await PantryApi.modify({
  id: 1,
  name: 'Freezer',
  metadata: { color: 'white' }
});

// Compartir despensa
await PantryApi.share(1, 'familiar@email.com');

// Ver usuarios con acceso
const sharedUsers = await PantryApi.getSharedUsers(1);

// Revocar acceso
await PantryApi.revokeShare(1, 3);

// --- Items de Despensa ---

// Agregar item
const pantryItem = await PantryApi.addItem(1, {
  product: {
    id: 10
  },
  quantity: 5,
  unit: 'kg',
  metadata: {}
});

// Listar items
const pantryItems = await PantryApi.getItems(1, undefined, {
  page: 1,
  limit: 10,
  search: 'leche'
});

// Actualizar item
await PantryApi.updateItem(1, 8, {
  quantity: 3,
  unit: 'litros',
  metadata: {}
});

// Eliminar item
await PantryApi.removeItem(1, 8);

// Eliminar despensa
await PantryApi.remove(1);
```

### Historial de Compras

```typescript
import { PurchaseApi, type PurchaseData } from '@/api';

// Listar historial
const purchases = await PurchaseApi.getAll(undefined, {
  page: 1,
  limit: 10,
  list_id: 1, // Filtrar por lista específica
  orderBy: 'createdAt',
  order: 'DESC'
});

// Obtener compra específica
const purchase = await PurchaseApi.get(15);
console.log(purchase.listItemArray); // Items comprados
console.log(purchase.list); // Lista original

// Restaurar compra (crear nueva lista desde el historial)
const restoredList = await PurchaseApi.restore(15);
console.log(restoredList.name); // Nueva lista creada
```

## Tipos TypeScript

Todos los wrappers incluyen tipos completos:

```typescript
// Los tipos de datos están disponibles
import type {
  UserData,
  CategoryData,
  ProductData,
  ShoppingListData,
  ListItemData,
  PantryData,
  PantryItemData,
  PurchaseData,
  PaginatedResponse
} from '@/api';

// Usar en funciones
async function createProduct(data: ProductData): Promise<ProductData> {
  return await ProductApi.add(data);
}

// Respuestas paginadas
const response: PaginatedResponse<CategoryData> = await CategoryApi.getAll();
```

## Manejo de Errores

```typescript
try {
  const product = await ProductApi.get(999);
} catch (error: any) {
  if (error.message) {
    console.error('Error de API:', error.message);
  }
  // Manejar error 404, 401, etc.
}
```

## AbortController (Cancelar Requests)

```typescript
const controller = new AbortController();

// Hacer request
const productsPromise = ProductApi.getAll(controller, { page: 1 });

// Cancelar después de 5 segundos
setTimeout(() => controller.abort(), 5000);

try {
  const products = await productsPromise;
} catch (error: any) {
  if (error.message?.includes('abort')) {
    console.log('Request cancelado');
  }
}
```

## Notas

- Todos los métodos excepto `UserApi.register()`, `UserApi.login()`, y métodos de recuperación de contraseña requieren que `Api.token` esté configurado
- Las respuestas paginadas incluyen: `data`, `page`, `per_page`, `total`, `totalPages`
- Los métodos `add` y `modify` retornan el objeto completo actualizado
- Los métodos `remove` no retornan nada (void)

## Migración desde JS

Si tenías código usando los wrappers `.js`, ahora simplemente cambia las importaciones:

```typescript
// Antes
import { CategoryApi } from '@/api/category.js';

// Ahora
import { CategoryApi } from '@/api';
// o
import { CategoryApi } from '@/api/category';
```

El resto del código debería funcionar igual, pero ahora con autocompletado y validación de tipos.
