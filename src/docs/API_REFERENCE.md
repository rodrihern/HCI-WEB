# HCI Grocery Manager - API Reference

## Base URL
```
http://localhost:8080
```

## Authentication
Bearer Token (JWT) en header: `Authorization: Bearer {token}`

---

## 📦 Categories

### POST `/api/categories`
Crear categoría
```json
{ "name": "Dairy", "metadata": {} }
```

### GET `/api/categories`
Listar categorías (con paginación, filtros: name, page, limit, orderBy, order)

### GET `/api/categories/{id}`
Obtener categoría específica

### PUT `/api/categories/{id}`
Actualizar categoría
```json
{ "name": "Dairy Updated", "metadata": {} }
```

### DELETE `/api/categories/{id}`
Eliminar categoría

---

## 🛒 Shopping Lists

### POST `/api/shopping-lists`
Crear lista de compras
```json
{
  "name": "Supermarket",
  "description": "Monthly groceries",
  "recurring": true,
  "metadata": {}
}
```

### GET `/api/shopping-lists`
Listar listas (filtros: name, owner, recurring, page, limit, orderBy, order)

### GET `/api/shopping-lists/{id}`
Obtener lista específica

### PUT `/api/shopping-lists/{id}`
Actualizar lista
```json
{
  "name": "Supermarket Updated",
  "description": "New description",
  "recurring": false,
  "metadata": {}
}
```

### DELETE `/api/shopping-lists/{id}`
Eliminar lista

### POST `/api/shopping-lists/{id}/purchase`
Marcar lista como comprada (crea registro en historial)
```json
{ "metadata": {} }
```

### POST `/api/shopping-lists/{id}/reset`
Resetear items (marcar todos como no comprados)

### POST `/api/shopping-lists/{id}/move-to-pantry`
Mover items comprados a despensa

### POST `/api/shopping-lists/{id}/share`
Compartir lista con usuario
```json
{ "email": "user@example.com" }
```

### GET `/api/shopping-lists/{id}/shared-users`
Ver usuarios con acceso compartido

### DELETE `/api/shopping-lists/{id}/share/{user_id}`
Revocar acceso compartido

---

## 📝 Shopping List Items

### POST `/api/shopping-lists/{id}/items`
Agregar item a lista
```json
{
  "product_id": 1,
  "quantity": 2,
  "unit": "kg",
  "metadata": {}
}
```

### GET `/api/shopping-lists/{id}/items`
Listar items (filtros: purchased, page, limit, orderBy, order, pantry_id, category_id, search)

### PUT `/api/shopping-lists/{id}/items/{item_id}`
Actualizar item
```json
{
  "quantity": 3,
  "unit": "units",
  "metadata": {}
}
```

### PATCH `/api/shopping-lists/{id}/items/{item_id}`
Toggle estado de comprado
```json
{ "purchased": true }
```

### DELETE `/api/shopping-lists/{id}/items/{item_id}`
Eliminar item de lista

---

## 🏺 Pantries (Despensas)

### POST `/api/pantries`
Crear despensa
```json
{
  "name": "Fridge",
  "metadata": { "color": "white" }
}
```

### GET `/api/pantries`
Listar despensas (filtros: owner, page, limit, orderBy, order)

### GET `/api/pantries/{id}`
Obtener despensa con sus items

### PUT `/api/pantries/{id}`
Actualizar despensa
```json
{
  "name": "Freezer",
  "metadata": { "color": "blue" }
}
```

### DELETE `/api/pantries/{id}`
Eliminar despensa

### POST `/api/pantries/{id}/share`
Compartir despensa
```json
{ "email": "user@example.com" }
```

### GET `/api/pantries/{id}/shared-users`
Ver usuarios con acceso

### DELETE `/api/pantries/{id}/share/{user_id}`
Revocar acceso

---

## 🍎 Pantry Items

### POST `/api/pantries/{id}/items`
Agregar item a despensa
```json
{
  "product_id": 1,
  "quantity": 5,
  "unit": "kg",
  "metadata": {}
}
```

### GET `/api/pantries/{id}/items`
Listar items (filtros: page, limit, orderBy, order, search)

### PUT `/api/pantries/{id}/items/{item_id}`
Actualizar item
```json
{
  "quantity": 3,
  "unit": "units",
  "metadata": {}
}
```

### DELETE `/api/pantries/{id}/items/{item_id}`
Eliminar item

---

## 🥕 Products

### POST `/api/products`
Crear producto
```json
{
  "name": "Milk",
  "category_id": 1,
  "pantry_id": 4,
  "metadata": { "barcode": "1234567890" }
}
```

### GET `/api/products`
Listar productos (filtros: name, category_id, pantry_id, page, limit, orderBy, order)

### GET `/api/products/{id}`
Obtener producto específico

### PUT `/api/products/{id}`
Actualizar producto
```json
{
  "name": "Milk Updated",
  "category_id": 2,
  "pantry_id": null,
  "metadata": {}
}
```

### DELETE `/api/products/{id}`
Eliminar producto

---

## 📊 Purchases (Historial)

### GET `/api/purchases`
Historial de compras (filtros: list_id, page, limit, orderBy, order)

### GET `/api/purchases/{id}`
Detalle de compra específica

### POST `/api/purchases/{id}/restore`
Restaurar compra (crear nueva lista desde historial)

---

## 👤 Users

### POST `/api/users/register`
Registrar usuario
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@email.com",
  "password": "123456",
  "metadata": {}
}
```

### POST `/api/users/login`
Iniciar sesión
```json
{
  "email": "john@email.com",
  "password": "123456"
}
```
**Response:** `{ "token": "jwt_token_here" }`

### GET `/api/users/profile`
Obtener perfil de usuario

### PUT `/api/users/profile`
Actualizar perfil
```json
{
  "name": "John Updated",
  "surname": "Doe Updated",
  "metadata": {}
}
```

### POST `/api/users/verify-account`
Verificar cuenta
```json
{ "code": "verification_code" }
```

### POST `/api/users/send-verification`
Reenviar código de verificación (query param: `email`)

### POST `/api/users/forgot-password`
Solicitar recuperación de contraseña (query param: `email`)

### POST `/api/users/reset-password`
Resetear contraseña
```json
{
  "code": "recovery_code",
  "password": "new_password"
}
```

### POST `/api/users/change-password`
Cambiar contraseña
```json
{
  "currentPassword": "old_pass",
  "newPassword": "new_pass"
}
```

### POST `/api/users/logout`
Cerrar sesión

---

## 📋 Modelos de Datos

### User
```typescript
{
  id: number
  name: string
  surname: string
  email: string
  metadata: object
  createdAt: string
  updatedAt: string
}
```

### Category
```typescript
{
  id: number
  name: string
  metadata: object
  createdAt: string
  updatedAt: string
}
```

### Product
```typescript
{
  id: number
  name: string
  metadata: object
  category: Category
  pantry: Pantry | null
  createdAt: string
  updatedAt: string
}
```

### ShoppingList
```typescript
{
  id: number
  name: string
  description: string
  recurring: boolean
  metadata: object
  owner: User
  sharedWith: User[]
  lastPurchasedAt: string | null
  createdAt: string
  updatedAt: string
}
```

### ListItem
```typescript
{
  id: number
  quantity: number
  unit: string
  metadata: object
  purchased: boolean
  lastPurchasedAt: string | null
  product: Product
  createdAt: string
  updatedAt: string
}
```

### Pantry
```typescript
{
  id: number
  name: string
  metadata: object
  owner: User
  sharedWith: User[]
  createdAt: string
  updatedAt: string
}
```

### PantryItem
```typescript
{
  id: number
  quantity: number
  unit: string
  metadata: object
  product: Product
  createdAt: string
  updatedAt: string
}
```

### Purchase
```typescript
{
  id: number
  metadata: object
  owner: User
  list: ShoppingList
  listItemArray: ListItem[]
  createdAt: string
}
```

---

## 🔐 Códigos de Respuesta

- **200** - OK
- **201** - Created
- **400** - Bad Request (datos inválidos)
- **401** - Unauthorized (sin autenticación)
- **404** - Not Found
- **500** - Internal Server Error

---

## 📝 Notas

- Todas las rutas excepto `/register`, `/login`, `/verify-account`, `/forgot-password`, `/reset-password`, `/send-verification` requieren autenticación JWT
- Los filtros de paginación están disponibles en la mayoría de endpoints GET: `page`, `limit`, `orderBy`, `order`
- El campo `metadata` es un objeto flexible para datos adicionales
- Las fechas siguen formato `YYYY-MM-DD`
