# Refactorización de Tipografía - Guía de Cambios

## ✅ Archivos Completados

### Configuración Base
- ✅ `src/assets/main.css` - Variables CSS y utilitarias
- ✅ `tailwind.config.js` - Configuración de Tailwind
- ✅ `index.html` - Google Fonts Roboto

### Vistas
- ✅ `LoginView.vue`
- ✅ `RegisterView.vue`
- ✅ `ListasView.vue`
- ✅ `ProductosView.vue`

### Componentes
- ✅ `PageHeader.vue`
- ✅ `BaseModal.vue`
- ✅ `ConfirmationModal.vue`
- ✅ `ListItem.vue`

## 📝 Reglas de Reemplazo

Para completar la refactorización en los archivos restantes, aplicar estos cambios:

### Reemplazos Directos

| Antes | Después | Uso |
|-------|---------|-----|
| `text-xs` | `t-caption` | Textos pequeños, metadatos |
| `text-sm` | `t-caption` | Textos pequeños, subtítulos |
| `text-base` | `t-body` | Texto normal (heredado por defecto) |
| `text-lg` | `t-body` | Texto normal |
| `text-xl` | `t-heading` | Títulos |
| `text-2xl` | `t-heading` | Títulos |
| `text-3xl` | `t-heading` | Títulos principales |
| `text-4xl` | `t-heading` | Títulos grandes |
| `text-5xl` | `t-heading` | Títulos muy grandes |
| `text-6xl` | `t-heading` | Títulos extra grandes |

- `App.vue` - text-2xl

### Casos Especiales

#### Iconos grandes (ProductCard)
```vue
<!-- Antes -->
<span :class="isExpanded ? 'text-6xl' : 'text-3xl'">

<!-- Después - mantener para iconos decorativos grandes -->
<span :class="isExpanded ? 'text-6xl' : 'text-3xl'">
```
Los iconos muy grandes pueden mantener sus tamaños personalizados.

#### Inputs y formularios
```vue
<!-- Antes -->
class="text-lg"

<!-- Después - eliminar, hereda t-body por defecto -->
class=""
```

#### Labels de formulario
```vue
<!-- Antes -->
<label class="text-2xl font-bold">

<!-- Después -->
<label class="t-heading font-bold">
```

## 🎯 Criterios de Aceptación

- [ ] Todos los textos usan Roboto
- [ ] Solo existen 3 tamaños: caption (12-14px), body (14-16px), heading (20-28px)
- [ ] Inputs heredan t-body por defecto
- [ ] Headings usan t-heading
- [ ] Metadatos y subtítulos usan t-caption
- [ ] Sin tamaños custom (text-xl, text-2xl, etc.) excepto iconos decorativos
- [ ] Responsive suave con clamp()

## 🔧 Comandos Útiles

### Buscar archivos pendientes
```bash
grep -r "text-\(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl\|6xl\)" src/**/*.vue
```

### Verificar archivos sin tamaños custom
```bash
grep -L "text-\(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl\|6xl\)" src/**/*.vue
```
