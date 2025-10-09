# Componentes Reutilizables 🧩

Esta carpeta contiene componentes Vue reutilizables usados en toda la aplicación.

## 📦 Componentes Disponibles

### 1. **PageHeader.vue**
Header consistente para todas las páginas con título, filtro opcional y botón de acción.

**Props:**
```typescript
{
  title: string           // Título de la página
  onAddClick: () => void  // Función al hacer clic en el botón +
  showFilter?: boolean    // Mostrar botón de filtro (opcional)
}
```

**Uso:**
```vue
<PageHeader 
  title="Mis listas" 
  :onAddClick="addNewList"
  :showFilter="true"
/>
```

---

### 2. **CollapsibleSection.vue**
Sección expandible/colapsable con animación suave.

**Props:**
```typescript
{
  title: string                      // Título de la sección
  isCollapsed?: boolean              // Estado inicial (default: false)
  showAddButton?: boolean            // Mostrar botón "Agregar"
  addButtonText?: string             // Texto del botón (default: "Agregar")
  onAddClick?: () => void            // Función del botón agregar
}
```

**Emisiones:**
```typescript
{
  'update:isCollapsed': (value: boolean) => void
}
```

**Uso:**
```vue
<CollapsibleSection
  :title="category"
  :showAddButton="true"
  addButtonText="Agregar"
  :onAddClick="() => addItem()"
>
  <!-- Contenido aquí -->
  <div>Tu contenido colapsable</div>
</CollapsibleSection>
```

---

### 3. **ProductCard.vue**
Tarjeta de producto con icono, nombre y acción opcional.

**Props:**
```typescript
{
  icon: string                // Emoji o icono del producto
  name: string                // Nombre del producto
  onActionClick?: () => void  // Función al hacer clic en el botón
  actionIcon?: string         // ID del icono (default: "add-sign")
}
```

**Slots:**
```vue
<!-- Slot para acciones personalizadas -->
<template #actions>
  <!-- Botones personalizados aquí -->
</template>
```

**Uso básico:**
```vue
<ProductCard
  :icon="product.icon"
  :name="product.name"
  :onActionClick="() => addToCart()"
/>
```

**Uso con slot personalizado:**
```vue
<ProductCard
  :icon="product.icon"
  :name="product.name"
>
  <template #actions>
    <button @click="decrement">-</button>
    <span>{{ quantity }}</span>
    <button @click="increment">+</button>
  </template>
</ProductCard>
```

---

## 🎨 Comparación: React vs Vue

Si vienes de React, aquí está la comparación de conceptos:

| React | Vue (Composition API) |
|-------|----------------------|
| `props` | `defineProps<T>()` |
| `useState()` | `ref()` / `reactive()` |
| `useEffect()` | `watch()` / `watchEffect()` |
| `useMemo()` | `computed()` |
| `children` | `<slot />` |
| `onChange` | `@update:modelValue` |
| Named slots | `<slot name="header" />` |

---

## 💡 Buenas Prácticas

1. **Props tipadas**: Siempre usa TypeScript para definir props
2. **Slots para flexibilidad**: Usa slots cuando el contenido varíe mucho
3. **Eventos claros**: Nombra los eventos con `on` prefix (ej: `onAddClick`)
4. **Componentes pequeños**: Mantén componentes enfocados en una sola responsabilidad
5. **Documentación**: Comenta las props complejas

---

## 🚀 Próximos Componentes Sugeridos

- `Modal.vue` - Modal reutilizable
- `Button.vue` - Botones con variantes
- `Input.vue` - Inputs con validación
- `Toast.vue` - Notificaciones
- `Dropdown.vue` - Selector desplegable

---

## 📚 Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript con Vue](https://vuejs.org/guide/typescript/overview.html)
