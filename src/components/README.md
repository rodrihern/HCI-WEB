# Componentes Reutilizables

Este directorio contiene componentes Vue reutilizables usados en toda la aplicación.

## BaseModal.vue
Modal base genérico que proporciona estructura y estilo consistente para todos los modales de la aplicación.

**Uso:**
```vue
<BaseModal 
  :show="showModal" 
  title="Mi Modal"
  max-width="lg"
  height="auto"
  @close="closeModal"
>
  <!-- Contenido personalizado aquí -->
  <div class="p-8">
    Tu contenido...
  </div>
</BaseModal>
```

**Props:**
- `show` (boolean, required): Controla la visibilidad del modal
- `title` (string, optional): Título del modal
- `maxWidth` ('sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl', default: '6xl'): Ancho máximo del modal
- `height` (string, default: '85vh'): Altura del modal

**Eventos:**
- `@close`: Emitido cuando se cierra el modal (ESC, click en X, o click fuera)

**Slots:**
- `title`: Personaliza el título del header
- default: Contenido principal del modal

**Características:**
- ✅ Cierre con tecla ESC
- ✅ Cierre al hacer click fuera del modal
- ✅ Animaciones de entrada/salida
- ✅ Backdrop blur
- ✅ Botón de cerrar en el header
- ✅ Estilos consistentes con el diseño de la app

---

## CreateListModal.vue
Modal especializado para crear nuevas listas de compras. Usa `BaseModal` internamente.

**Uso:**
```vue
<CreateListModal @close="handleClose" />
```

**Eventos:**
- `@close`: Emitido cuando se cierra el modal

**Características:**
- Layout de dos columnas
- Columna izquierda: Nombre de lista y productos agregados
- Columna derecha: Buscador y agregar productos
- Controles de cantidad integrados
- Validación del nombre de lista

---

## CreateProductModal.vue
Modal ejemplo para crear nuevos productos. Demuestra cómo usar `BaseModal` para casos simples.

**Uso:**
```vue
<CreateProductModal 
  :show="showProductModal"
  @close="closeProductModal"
  @submit="handleProductSubmit"
/>
```

**Props:**
- `show` (boolean, required): Controla la visibilidad

**Eventos:**
- `@close`: Emitido cuando se cierra el modal
- `@submit`: Emitido con los datos del producto `{ name: string, category: string }`

---

## PageHeader.vue
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
