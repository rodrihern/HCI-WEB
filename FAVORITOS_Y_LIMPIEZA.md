# Listas Recurrentes y Limpieza de Mock Data

## Resumen de Cambios

Se han realizado los siguientes cambios para mejorar la funcionalidad y limpiar la mock data innecesaria:

---

## 1. ✨ Implementación de Listas Recurrentes

### ListasView.vue

#### Funcionalidad Implementada:
- ✅ **Estrellas** para marcar listas como recurrentes
- ✅ **Click en la estrella** marca/desmarca como recurrente
- ✅ **Animación** al hacer toggle del estado recurrente
- ✅ **Ordenamiento**: Listas recurrentes aparecen primero, luego por fecha

#### Implementación:
```typescript
// Ordenamiento con recurrentes primero
const sortedLists = computed(() => {
  return [...shoppingLists.value].sort((a, b) => {
    // Primero por recurrentes
    const aRec = a.recurring === true ? 1 : 0
    const bRec = b.recurring === true ? 1 : 0
    if (aRec !== bRec) return bRec - aRec
    
    // Luego por fecha de creación
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })
})
```

#### API Integration:
- El estado recurrente se guarda en el campo `recurring`
- Al hacer toggle, se actualiza la lista completa vía API:
```typescript
const toggleRecurringWithAnimation = async (id: number) => {
  const list = shoppingLists.value.find(l => l.id === id)
  if (list) {
    const updatedList = {
      ...list,
      recurring: !list.recurring
    }
    await shoppingListStore.modify(updatedList)
  }
}
```

#### Visual:
- ⭐ **Estrella amarilla rellena**: Lista recurrente
- ☆ **Estrella blanca outline**: Lista normal (una sola vez)
- 🎯 **Animación bounce**: Al cambiar estado
- 💡 **Tooltip**: Muestra el estado al hacer hover

---

## 2. 🧹 Limpieza de Mock Data

### PreviewListModal.vue

#### Eliminado:
- ❌ **Mock products array** (8 productos hardcodeados)
- ❌ **filteredProducts computed**
- ❌ **Modal de agregar producto** (con cantidad y unidad)
- ❌ **Estado del modal** (showAddProductModal, selectedProduct, etc.)
- ❌ **Funciones relacionadas**: openAddProductModal, closeAddProductModal, addProductFromList
- ❌ **Unit dropdown** (availableUnits, toggleUnitDropdown, etc.)
- ❌ **Event listeners** (closeDropdownOnOutsideClick)
- ❌ **Lifecycle hooks** (onMounted, onBeforeUnmount)

#### Actualizado:
```typescript
// Usuarios ahora viene de la lista real
const listUsers = computed(() => {
  if (!currentList.value) return []
  
  // TODO: Get actual shared users from API
  // For now, just show owner
  return [
    { id: '1', name: 'Yo', avatar: '👤', isOwner: true }
  ]
})
```

#### Simplificado en template:
```vue
<!-- Lista de productos disponibles -->
<div class="flex-1 overflow-y-auto px-8 pb-8">
  <div class="text-gray-400 text-center py-12">
    <p class="text-lg">Busca productos para agregarlos</p>
    <p class="text-sm mt-2">Los productos se mostrarán aquí</p>
  </div>
</div>
```

### stores/lists.ts

#### Eliminado:
```typescript
// ANTES: Mock data de productos
const products = ref<Product[]>([
  { id: '1', name: 'Banana', category: 'Frutas', icon: '🍌' },
  { id: '2', name: 'Leche Proteica', category: 'Lácteos', icon: '🥛' },
  // ... más productos
])

// AHORA: Array vacío para API
const products = ref<Product[]>([])
```

---

## 3. 📊 Estructura de Datos - Listas Recurrentes

### Cómo se almacenan:

```typescript
interface ShoppingListData {
  id: number
  name: string
  description: string
  recurring: boolean  // ← Aquí se controla si es recurrente
  metadata: Record<string, any>
  // ... otros campos
}
```

### API Calls:

1. **Marcar como recurrente:**
```typescript
PUT /api/shopping-lists/{id}
{
  "name": "Mi Lista",
  "description": "...",
  "recurring": true,  // ← Toggle esto
  "metadata": {}
}
```

2. **Leer estado recurrente:**
- Al cargar las listas, `recurring` indica si es recurrente
- El componente ordena automáticamente

### ¿Qué significa "recurrente"?
- Una lista recurrente es una que usas regularmente (compra mensual, semanal, etc.)
- Aparece primero para fácil acceso
- Útil para listas de compras habituales

---

## 4. 🎨 Experiencia de Usuario

### Antes:
- ❌ No había forma de marcar listas recurrentes
- ❌ Mock data de productos confundía
- ❌ Modal de agregar producto extra innecesario
- ❌ Lista desordenada

### Ahora:
- ✅ Click en estrella para marcar recurrente
- ✅ Listas recurrentes aparecen primero
- ✅ Animación visual al cambiar
- ✅ Sin productos mock confusos
- ✅ UI más limpia y simple
- ✅ Persistencia en backend
- ✅ Tooltip explicativo en hover

---

## 5. 📝 Estado de la Aplicación

### Mock Data Restante (no tocada):
- Pantry sections (despensa)
- History items (historial)
- Colaboradores temporales en CreateListModal

### Real API Integration:
- ✅ Shopping Lists (GET, POST, PUT, DELETE)
- ✅ Estado recurrente (campo `recurring`)
- ✅ List items (productos en listas)

---

## 6. 🔄 Flujo Completo - Listas Recurrentes

1. Usuario ve sus listas
2. Click en estrella de una lista
3. Animación de bounce
4. API actualiza campo `recurring`
5. Lista se reordena automáticamente
6. Listas recurrentes aparecen arriba
7. Estado persiste en backend

### Casos de Uso:
- **Compra mensual**: Marca como recurrente, está siempre arriba
- **Lista ocasional**: Sin estrella, se ordena por fecha
- **Acceso rápido**: Listas recurrentes siempre al alcance

---

## 7. ✅ Testing Checklist

- [ ] Ver lista de listas con estrellas
- [ ] Click en estrella vacía → Se llena de amarillo (recurrente)
- [ ] Click en estrella llena → Se vacía (no recurrente)
- [ ] Listas recurrentes aparecen primero
- [ ] Animación funciona correctamente
- [ ] Estado persiste después de refresh
- [ ] Tooltip muestra "Lista recurrente" o "Hacer recurrente"
- [ ] PreviewListModal sin productos mock
- [ ] CreateListModal funcionando normalmente
- [ ] Checkbox "Lista recurrente" en CreateListModal funciona

---

## 8. 🚀 Próximos Pasos

1. Integrar API de productos real
2. Mostrar productos disponibles en búsqueda
3. Implementar compartir listas con usuarios reales
4. Agregar filtros y categorías de productos
5. Sincronización en tiempo real de colaboradores
