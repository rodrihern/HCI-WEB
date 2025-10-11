# Context Menu en Listas - Documentación

## Resumen
Se ha agregado un menú de contexto (3 puntos) junto a la estrella de cada lista con las opciones: Editar, Compartir y Eliminar, todas conectadas a la API real.

---

## 🎯 Funcionalidades Implementadas

### 1. **Menú de Contexto (3 Puntos)**

#### Ubicación:
- Aparece junto a la estrella de recurrente en cada lista
- Se muestra al hacer click en los 3 puntos verticales

#### Opciones del menú:
1. **✏️ Editar**: Abre la vista previa de la lista (PreviewListModal)
2. **👥 Compartir**: Abre un modal para compartir con colaboradores
3. **🗑️ Eliminar**: Muestra confirmación y elimina la lista

---

## 🔧 Implementación Técnica

### Componentes Utilizados:
```typescript
import ContextMenu from '@/components/ContextMenu.vue'
import BaseModal from '@/components/BaseModal.vue'
import { ShoppingListApi } from '@/api/shoppingList'
```

### Estado del Componente:
```typescript
// Modal de compartir
const showShareModal = ref(false)
const listToShare = ref<number | null>(null)
const shareEmail = ref('')
const isSharing = ref(false)
const shareError = ref('')
const shareSuccess = ref(false)
```

### Funciones Principales:

#### 1. **Menú de Contexto**
```typescript
const getContextMenuItems = (listId: number): ContextMenuItem[] => {
  return [
    {
      label: 'Editar',
      onClick: () => openPreviewList(listId)
    },
    {
      label: 'Compartir',
      onClick: () => openShareModal(listId)
    },
    {
      label: 'Eliminar',
      onClick: () => confirmDelete(listId),
      variant: 'danger'
    }
  ]
}
```

#### 2. **Compartir Lista**
```typescript
const shareList = async () => {
  if (!listToShare.value || !shareEmail.value.trim()) {
    shareError.value = 'Por favor ingresa un email válido'
    return
  }

  isSharing.value = true
  
  try {
    await ShoppingListApi.share(listToShare.value, shareEmail.value.trim())
    shareSuccess.value = true
    
    // Auto-cerrar después de 1.5 segundos
    setTimeout(() => closeShareModal(), 1500)
  } catch (error) {
    shareError.value = 'Error al compartir la lista. Intenta de nuevo.'
  } finally {
    isSharing.value = false
  }
}
```

---

## 🎨 Interfaz de Usuario

### Layout del ListItem:
```vue
<template #actions>
  <div class="flex items-center gap-1">
    <!-- Estrella de Recurrente -->
    <button @click.stop="toggleRecurringWithAnimation(list.id)">
      <!-- SVG de estrella -->
    </button>
    
    <!-- Menú de Contexto (3 puntos) -->
    <div @click.stop>
      <ContextMenu
        :items="getContextMenuItems(list.id)"
        icon-color="text-white opacity-60 hover:opacity-100"
      />
    </div>
  </div>
</template>
```

### Modal de Compartir:
```vue
<BaseModal :show="showShareModal" title="Compartir Lista">
  <!-- Input de email -->
  <input 
    v-model="shareEmail"
    type="email"
    placeholder="ejemplo@email.com"
  />
  
  <!-- Mensaje de éxito -->
  <div v-if="shareSuccess">
    ✅ ¡Lista compartida exitosamente!
  </div>
  
  <!-- Mensaje de error -->
  <p v-if="shareError">{{ shareError }}</p>
  
  <!-- Botones -->
  <button @click="shareList">Compartir</button>
</BaseModal>
```

---

## 📡 API Integration

### 1. **Compartir Lista**
```typescript
POST /api/shopping-lists/{id}/share
Body: { "email": "user@example.com" }
```

**Respuesta exitosa**: 
- Status: 200
- La lista ahora es visible para el usuario compartido

**Errores posibles**:
- 404: Lista no encontrada
- 400: Email inválido
- 409: Usuario ya tiene acceso

### 2. **Eliminar Lista**
```typescript
DELETE /api/shopping-lists/{id}
```

**Respuesta exitosa**:
- Status: 200/204
- Lista eliminada de la base de datos

### 3. **Editar Lista**
- Abre PreviewListModal con el ID de la lista
- El modal carga los datos desde la API
- Cambios se persisten automáticamente

---

## 🔄 Flujo de Usuario

### Compartir una Lista:
1. Usuario hace click en **3 puntos** (⋮)
2. Click en **"Compartir"**
3. Se abre modal con input de email
4. Usuario ingresa email del colaborador
5. Click en **"Compartir"** o presiona Enter
6. Loading state: "Compartiendo..."
7. Success: ✅ "¡Lista compartida exitosamente!"
8. Modal se cierra automáticamente en 1.5s

### Editar una Lista:
1. Click en **3 puntos** (⋮)
2. Click en **"Editar"**
3. Se abre PreviewListModal
4. Usuario puede modificar nombre, productos, etc.
5. Cambios se guardan automáticamente

### Eliminar una Lista:
1. Click en **3 puntos** (⋮)
2. Click en **"Eliminar"** (texto rojo)
3. Modal de confirmación aparece
4. Confirmar eliminación
5. Lista se elimina vía API
6. Lista desaparece de la vista

---

## 🎨 Estilos y UX

### Menú de Contexto:
- **Color**: Blanco con 60% opacidad
- **Hover**: 100% opacidad
- **Position**: Junto a la estrella
- **Z-index**: Aparece por encima del contenido

### Opciones del Menú:
- **Default**: Texto gris oscuro
- **Hover**: Fondo gris claro
- **Danger (Eliminar)**: Texto rojo

### Modal de Compartir:
- **Tamaño**: Mediano (max-width: md)
- **Input**: Email con validación HTML5
- **Success**: Fondo verde con ✅
- **Error**: Texto rojo debajo del input
- **Info**: Caja azul con 💡

### Estados del Modal:
```
┌─────────────────────────────────┐
│ Compartir Lista                 │
├─────────────────────────────────┤
│                                 │
│ Email del colaborador           │
│ ┌─────────────────────────────┐ │
│ │ ejemplo@email.com           │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 El usuario recibirá acceso  │
│    para ver y editar esta lista│
│                                 │
│ [Cancelar]  [Compartir]        │
└─────────────────────────────────┘

↓ Click en Compartir

┌─────────────────────────────────┐
│ Compartir Lista                 │
├─────────────────────────────────┤
│                                 │
│ ✅ ¡Lista compartida           │
│    exitosamente!                │
│                                 │
│ [Cerrar]                       │
└─────────────────────────────────┘
```

---

## ✅ Validaciones

### Email:
- ✓ No puede estar vacío
- ✓ Debe ser formato email válido (HTML5)
- ✓ Se trimea automáticamente

### Estados:
- ✓ Botón deshabilitado si email vacío
- ✓ Botón deshabilitado durante loading
- ✓ No se puede cerrar modal durante loading

---

## 🐛 Manejo de Errores

### Errores de API:
```typescript
try {
  await ShoppingListApi.share(listId, email)
  // Success
} catch (error: any) {
  // Error de red
  if (!error.message) {
    shareError.value = 'Error de conexión'
  }
  // Error del servidor
  else {
    shareError.value = error.message
  }
}
```

### Mensajes de Error:
- "Por favor ingresa un email válido"
- "Error al compartir la lista. Intenta de nuevo."
- Errores específicos del servidor (404, 400, etc.)

---

## 📱 Responsive Design

- Modal se adapta a pantallas pequeñas
- Menú de contexto se posiciona correctamente
- Botones mantienen buen tamaño táctil
- Input de email ocupa todo el ancho disponible

---

## 🚀 Mejoras Futuras

### Compartir:
- [ ] Autocompletar con usuarios existentes
- [ ] Mostrar lista de usuarios ya compartidos
- [ ] Revocar acceso compartido
- [ ] Niveles de permisos (ver/editar)

### Menú:
- [ ] Opción "Duplicar lista"
- [ ] Opción "Archivar"
- [ ] Opción "Exportar"

### UX:
- [ ] Animación al abrir menú
- [ ] Feedback háptico en móvil
- [ ] Undo después de eliminar

---

## 🧪 Testing Checklist

- [ ] Menú aparece al click en 3 puntos
- [ ] "Editar" abre PreviewListModal
- [ ] "Compartir" abre modal de compartir
- [ ] Input de email funciona correctamente
- [ ] Validación de email vacío
- [ ] API call exitoso muestra success
- [ ] API call fallido muestra error
- [ ] Modal se cierra automáticamente tras éxito
- [ ] "Eliminar" muestra confirmación
- [ ] Lista se elimina tras confirmar
- [ ] Menú se cierra al seleccionar opción
- [ ] Click fuera del menú lo cierra
- [ ] Escape cierra el menú
- [ ] Loading states funcionan correctamente

---

## 📚 Código Relacionado

### Archivos Modificados:
- `src/views/ListasView.vue` - Vista principal con menú
- `src/components/ContextMenu.vue` - Componente existente reutilizado

### APIs Utilizadas:
- `ShoppingListApi.share(id, email)` - Compartir lista
- `ShoppingListApi.remove(id)` - Eliminar lista

### Componentes:
- `ContextMenu` - Menú de 3 puntos
- `BaseModal` - Modal de compartir
- `ConfirmationModal` - Confirmación de eliminar
