# Ejemplos de uso de ConfirmationModal

Este documento muestra diferentes casos de uso del componente `ConfirmationModal`.

## 1. Eliminar un elemento (variant: danger)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showDeleteConfirm = ref(false)
const itemToDelete = ref<string | null>(null)

const confirmDelete = (id: string) => {
  itemToDelete.value = id
  showDeleteConfirm.value = true
}

const handleDelete = () => {
  if (itemToDelete.value) {
    // Lógica de eliminación
    store.deleteItem(itemToDelete.value)
    itemToDelete.value = null
  }
  showDeleteConfirm.value = false
}
</script>

<template>
  <!-- Botón que abre el modal -->
  <button @click="confirmDelete(item.id)">Eliminar</button>

  <!-- Modal de confirmación -->
  <ConfirmationModal
    :show="showDeleteConfirm"
    title="Eliminar producto"
    message="¿Estás seguro de que quieres eliminar este producto?"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="handleDelete"
    @cancel="showDeleteConfirm = false"
  >
    <template #details>
      <p class="text-sm text-gray-600 mt-2">
        Esta acción no se puede deshacer.
      </p>
    </template>
  </ConfirmationModal>
</template>
```

## 2. Guardar cambios (variant: info)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showSaveConfirm = ref(false)
const hasUnsavedChanges = ref(true)

const saveChanges = () => {
  // Lógica para guardar
  console.log('Cambios guardados')
  hasUnsavedChanges.value = false
  showSaveConfirm.value = false
}

const discardChanges = () => {
  // Lógica para descartar
  hasUnsavedChanges.value = false
  showSaveConfirm.value = false
}
</script>

<template>
  <ConfirmationModal
    :show="showSaveConfirm"
    title="Guardar cambios"
    message="¿Deseas guardar los cambios antes de salir?"
    confirm-text="Guardar"
    cancel-text="Descartar"
    variant="info"
    @confirm="saveChanges"
    @cancel="discardChanges"
  />
</template>
```

## 3. Advertencia (variant: warning)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showWarning = ref(false)

const proceedWithAction = () => {
  // Continuar con la acción
  console.log('Acción confirmada')
  showWarning.value = false
}
</script>

<template>
  <ConfirmationModal
    :show="showWarning"
    title="Advertencia"
    message="Esta acción modificará todos los registros relacionados."
    confirm-text="Continuar"
    cancel-text="Cancelar"
    variant="warning"
    @confirm="proceedWithAction"
    @cancel="showWarning = false"
  >
    <template #details>
      <ul class="text-sm text-gray-600 mt-2 list-disc list-inside">
        <li>Se actualizarán 15 registros</li>
        <li>El proceso puede tardar varios minutos</li>
        <li>No se puede cancelar una vez iniciado</li>
      </ul>
    </template>
  </ConfirmationModal>
</template>
```

## 4. Confirmación simple (sin detalles adicionales)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showLogoutConfirm = ref(false)

const logout = () => {
  // Lógica de logout
  router.push('/login')
  showLogoutConfirm.value = false
}
</script>

<template>
  <ConfirmationModal
    :show="showLogoutConfirm"
    title="Cerrar sesión"
    message="¿Estás seguro de que quieres cerrar sesión?"
    confirm-text="Cerrar sesión"
    cancel-text="Cancelar"
    variant="info"
    @confirm="logout"
    @cancel="showLogoutConfirm.value = false"
  />
</template>
```

## 5. Con contenido adicional en el body

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showDeleteListConfirm = ref(false)
const listName = ref('Lista de compras')
const productCount = ref(12)
</script>

<template>
  <ConfirmationModal
    :show="showDeleteListConfirm"
    title="Eliminar lista"
    message="¿Estás seguro de que quieres eliminar esta lista?"
    variant="danger"
    @confirm="deleteList"
    @cancel="showDeleteListConfirm = false"
  >
    <template #details>
      <div class="mt-3 p-3 bg-gray-100 rounded-lg">
        <p class="text-sm font-semibold text-gray-800">{{ listName }}</p>
        <p class="text-xs text-gray-600 mt-1">{{ productCount }} productos</p>
      </div>
    </template>

    <!-- Contenido adicional usando el slot default -->
    <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">
        ⚠️ También se eliminarán todos los productos asociados
      </p>
    </div>
  </ConfirmationModal>
</template>
```

## 6. Reemplazando window.confirm()

**Antes (no recomendado):**
```vue
<script setup lang="ts">
const deleteItem = (id: string) => {
  if (confirm('¿Estás seguro?')) {
    store.deleteItem(id)
  }
}
</script>
```

**Después (recomendado):**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const showConfirm = ref(false)
const itemToDelete = ref<string | null>(null)

const confirmDelete = (id: string) => {
  itemToDelete.value = id
  showConfirm.value = true
}

const deleteItem = () => {
  if (itemToDelete.value) {
    store.deleteItem(itemToDelete.value)
  }
  showConfirm.value = false
  itemToDelete.value = null
}
</script>

<template>
  <button @click="confirmDelete(item.id)">Eliminar</button>

  <ConfirmationModal
    :show="showConfirm"
    message="¿Estás seguro?"
    variant="danger"
    @confirm="deleteItem"
    @cancel="showConfirm = false"
  />
</template>
```

## Mejores prácticas

### 1. Usar la variante correcta
- **danger** (rojo): Eliminaciones, acciones destructivas irreversibles
- **warning** (amarillo): Acciones que requieren precaución pero no son destructivas
- **info** (verde): Confirmaciones generales, guardar cambios

### 2. Mensajes claros y concisos
```vue
<!-- ✅ Bien -->
<ConfirmationModal
  message="¿Estás seguro de que quieres eliminar este producto?"
/>

<!-- ❌ Evitar -->
<ConfirmationModal
  message="Eliminar"
/>
```

### 3. Textos de botones descriptivos
```vue
<!-- ✅ Bien -->
<ConfirmationModal
  confirm-text="Eliminar producto"
  cancel-text="Mantener"
/>

<!-- ❌ Evitar -->
<ConfirmationModal
  confirm-text="Sí"
  cancel-text="No"
/>
```

### 4. Proporcionar contexto adicional cuando sea necesario
```vue
<ConfirmationModal message="¿Eliminar esta lista?">
  <template #details>
    <p class="text-sm text-gray-600 mt-2">
      Se eliminarán también todos los productos asociados.
    </p>
  </template>
</ConfirmationModal>
```

### 5. Limpiar estado después de confirmar/cancelar
```vue
<script setup>
const handleConfirm = () => {
  // Ejecutar acción
  store.deleteItem(itemToDelete.value)
  
  // Limpiar estado
  itemToDelete.value = null
  showConfirm.value = false
}

const handleCancel = () => {
  // Limpiar estado
  itemToDelete.value = null
  showConfirm.value = false
}
</script>
```

## Personalización avanzada

### Cambiar colores según la variante
Las variantes ya están pre-configuradas pero puedes modificarlas en el componente:

```typescript
const variantStyles = {
  danger: {
    confirmBg: 'bg-red-600 hover:bg-red-700',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100'
  },
  warning: {
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100'
  },
  info: {
    confirmBg: 'bg-verde-sidebar hover:bg-verde-contraste',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100'
  }
}
```
