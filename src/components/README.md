# Componentes Reutilizables

Este directorio contiene componentes Vue reutilizables usados en toda la aplicación.

## ContextMenu.vue
Menú contextual desplegable con opciones personalizables. Se usa típicamente junto con un botón de tres puntos.

**Props:**
- `show` (boolean, requerido): Controla la visibilidad del menú
- `items` (ContextMenuItem[], requerido): Array de opciones del menú

**Interfaz ContextMenuItem:**
```typescript
interface ContextMenuItem {
  label: string           // Texto del botón
  onClick: () => void     // Función a ejecutar al hacer clic
  variant?: 'default' | 'danger'  // Estilo del botón (default o rojo para acciones destructivas)
}
```

**Uso:**
```vue
<script setup lang="ts">
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu.vue'

const openMenuKey = ref<string | null>(null)

const toggleMenu = (e: Event, id: string) => {
  e.stopPropagation()
  openMenuKey.value = openMenuKey.value === id ? null : id
}
</script>

<template>
  <button @click="toggleMenu($event, item.id)">
    <svg><!-- Icono de tres puntos --></svg>
  </button>
  
  <ContextMenu
    :show="openMenuKey === item.id"
    :items="[
      { label: 'Modificar', onClick: () => edit(item.id) },
      { label: 'Eliminar', onClick: () => delete(item.id), variant: 'danger' }
    ]"
  />
</template>
```

---

## ListItem.vue
Componente genérico para mostrar elementos de lista con texto principal, subtítulo opcional, icono, controles de cantidad y acciones personalizadas mediante slots.

**Props:**
- `title` (string, requerido): Texto principal del item
- `subtitle` (string, opcional): Texto secundario debajo del título
- `icon` (string, opcional): Emoji o icono a mostrar a la izquierda
- `showQuantityControls` (boolean, default: false): Mostrar botones +/- para cantidad
- `quantity` (number, default: 0): Cantidad actual (si showQuantityControls es true)
- `isAnimating` (boolean, default: false): Activar animación de escala

**Events:**
- `@quantity-change(change: number)`: Emitido cuando cambia la cantidad (+1 o -1)

**Slots:**
- `actions`: Contenido personalizado para el área de acciones (botones, menús, etc.)

**Ejemplo 1 - ListasView (con botón de favorito):**
```vue
<ListItem
  :title="list.name"
  subtitle="Creada por Mamá"
  :is-animating="animatingFavorites.has(list.id)"
>
  <template #actions>
    <button @click="toggleFavorite(list.id)" class="p-2">
      <svg v-if="list.isFavorite" class="w-7 h-7 text-yellow-300">...</svg>
      <svg v-else class="w-7 h-7 text-white">...</svg>
    </button>
  </template>
</ListItem>
```

**Ejemplo 2 - DespensaView (con controles de cantidad y ContextMenu):**
```vue
<ListItem
  :title="product.name"
  :icon="product.icon"
  :show-quantity-controls="true"
  :quantity="item.quantity"
  @quantity-change="(change) => updateQuantity(change)"
>
  <template #actions>
    <button @click="toggleMenu($event, item.id)">
      <svg>...</svg> <!-- Icono de tres puntos -->
    </button>
    <ContextMenu
      :show="openMenuKey === item.id"
      :items="[
        { label: 'Modificar', onClick: () => modify(item.id) },
        { label: 'Eliminar', onClick: () => delete(item.id), variant: 'danger' }
      ]"
    />
  </template>
</ListItem>
```

---

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
Modal especializado para crear nuevos productos. Usa `BaseModal` internamente.

**Uso:**
```vue
<CreateProductModal 
  :show="showProductModal"
  @close="closeProductModal"
/>
```

**Props:**
- `show` (boolean, required): Controla la visibilidad

**Eventos:**
- `@close`: Emitido cuando se cierra el modal

**Características:**
- Input de nombre del producto
- Área de carga de multimedia (imágenes)
- Selector de categoría con:
  - Búsqueda filtrada
  - Lista de categorías existentes
  - Opción de crear nueva categoría
- Selector de despensa (opcional) con:
  - Búsqueda filtrada
  - Lista de despensas existentes
  - Opción de crear nueva despensa
- Validación de campos requeridos
- Integración con el store de Pinia
- Estilo verde consistente con el diseño de la app

---

## ConfirmationModal.vue
Modal genérico de confirmación para acciones que requieren aprobación del usuario. Usa `BaseModal` internamente.

**Uso básico:**
```vue
<script setup>
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showDeleteConfirm = ref(false)

const handleDelete = () => {
  // Acción de eliminación
  console.log('Eliminado!')
  showDeleteConfirm.value = false
}
</script>

<template>
  <ConfirmationModal
    :show="showDeleteConfirm"
    title="Eliminar producto"
    message="¿Estás seguro de que quieres eliminar este producto?"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="handleDelete"
    @cancel="showDeleteConfirm = false"
  />
</template>
```

**Props:**
- `show` (boolean, required): Controla la visibilidad
- `title` (string, default: 'Confirmar acción'): Título del modal
- `message` (string, required): Mensaje de confirmación
- `confirmText` (string, default: 'Confirmar'): Texto del botón de confirmar
- `cancelText` (string, default: 'Cancelar'): Texto del botón de cancelar
- `variant` ('danger' | 'warning' | 'info', default: 'danger'): Estilo visual del modal

**Eventos:**
- `@confirm`: Emitido cuando el usuario confirma la acción
- `@cancel`: Emitido cuando el usuario cancela (botón cancelar, ESC, o click fuera)

**Slots:**
- `details`: Contenido adicional debajo del mensaje principal
- default: Contenido adicional antes de los botones

**Variantes:**

1. **danger** (rojo) - Para acciones destructivas:
```vue
<ConfirmationModal
  variant="danger"
  message="¿Estás seguro de que quieres eliminar esta lista?"
/>
```

2. **warning** (amarillo) - Para advertencias:
```vue
<ConfirmationModal
  variant="warning"
  message="Esta acción no se puede deshacer"
/>
```

3. **info** (verde) - Para confirmaciones generales:
```vue
<ConfirmationModal
  variant="info"
  message="¿Deseas guardar los cambios?"
/>
```

**Ejemplo con contenido adicional:**
```vue
<ConfirmationModal
  :show="showConfirm"
  message="¿Eliminar esta lista?"
  variant="danger"
  @confirm="deleteList"
  @cancel="showConfirm = false"
>
  <template #details>
    <p class="text-sm text-gray-600 mt-2">
      Se eliminarán también todos los productos asociados.
    </p>
  </template>
</ConfirmationModal>
```

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
