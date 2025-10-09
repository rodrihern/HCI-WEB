# 🎨 Guía de Colores - Tailwind CSS v4

## ⚠️ IMPORTANTE: Estás usando Tailwind CSS v4

En Tailwind v4, los colores personalizados se definen en `src/assets/main.css` usando la directiva `@theme`.

### Variables de Color Disponibles

Definidas en `src/assets/main.css`:

```css
@theme {
  --color-verde-claro: #8DAF7E;
  --color-fondo: #FEFFF7;
  --color-verde-sidebar: #68AE6F;
  --color-verde-contraste: #5C805E;
}
```

| Variable CSS | Clase Tailwind | Color | Uso |
|--------------|----------------|-------|-----|
| `--color-verde-claro` | `verde-claro` | `#8DAF7E` | Fondo de tarjetas y elementos destacados |
| `--color-verde-sidebar` | `verde-sidebar` | `#68AE6F` | Color principal de botones y elementos interactivos |
| `--color-verde-contraste` | `verde-contraste` | `#5C805E` | Hover states y variaciones oscuras |
| `--color-fondo` | `fondo` | `#FEFFF7` | Color de fondo general de la aplicación |

## ✅ Cómo Usar (Tailwind v4)

### Colores de Fondo
```vue
<div class="bg-verde-claro">
<div class="bg-verde-sidebar">
<div class="bg-verde-contraste">
<div class="bg-fondo">
```

### Colores de Texto
```vue
<span class="text-verde-claro">
<h1 class="text-verde-sidebar">
<p class="text-verde-contraste">
```

### Colores de Borde
```vue
<div class="border-verde-claro">
<input class="focus:border-verde-sidebar">
```

### Gradientes
```vue
<button class="bg-gradient-to-br from-verde-sidebar to-verde-contraste">
```

### Con Opacidad
```vue
<div class="bg-verde-claro/50">  <!-- 50% opacidad -->
<div class="bg-verde-sidebar/80">  <!-- 80% opacidad -->
```

## ❌ Evitar

**NO uses colores hardcodeados con valores hexadecimales:**

```vue
<!-- ❌ INCORRECTO -->
<div class="bg-[#8DAF7E]">
<div class="bg-[#68AE6F]">
<div class="text-[#68AE6F]">

<!-- ✅ CORRECTO -->
<div class="bg-verde-claro">
<div class="bg-verde-sidebar">
<div class="text-verde-sidebar">
```

## 🔧 Agregar Nuevos Colores (Tailwind v4)

Para agregar nuevos colores, edita `src/assets/main.css`:

```css
@theme {
  --color-verde-claro: #8DAF7E;
  --color-verde-sidebar: #68AE6F;
  --color-verde-contraste: #5C805E;
  --color-fondo: #FEFFF7;
  --color-tu-nuevo-color: #123456; /* ✨ Nuevo color */
}
```

Luego úsalo en tus componentes:
```vue
<div class="bg-tu-nuevo-color">
```

### ⚠️ Reglas para nombres de colores en Tailwind v4:

1. **Prefijo `--color-` en el CSS**: `--color-mi-color-nuevo` ✅
2. **kebab-case en el CSS**: `--color-verde-claro` ✅
3. **Sin prefijo `--color-` en las clases**: `bg-verde-claro` ✅
4. **kebab-case en las clases**: `bg-mi-color-nuevo` ✅

**Ejemplo completo:**
```css
/* En main.css */
@theme {
  --color-azul-profundo: #1E3A8A;
}
```

```vue
<!-- En tus componentes -->
<div class="bg-azul-profundo text-white">
  Hola mundo
</div>
```

## 📝 Diferencias con Tailwind v3

| Tailwind v3 | Tailwind v4 |
|-------------|-------------|
| `tailwind.config.js` | `@theme` en `main.css` |
| `'verde-claro': '#...'` | `--color-verde-claro: #...` |
| Requiere reiniciar servidor | Auto-reload en dev |

## 🔄 Cómo Aplicar Cambios

Cuando cambies colores en `main.css`:

1. **Guardar el archivo** - Vite detectará automáticamente
2. **Esperar Hot Module Replacement (HMR)** - ~1-2 segundos
3. Si no funciona, reiniciar el servidor:
   ```bash
   # Limpiar caché y reiniciar
   rm -rf node_modules/.vite && npm run dev
   ```

## 🎯 Beneficios de Usar Variables

- ✅ **Consistencia**: Todos usan los mismos colores
- ✅ **Mantenibilidad**: Cambiar un color en un solo lugar
- ✅ **Autocompletado**: Tu IDE sugerirá los colores disponibles
- ✅ **Refactorización fácil**: Buscar y reemplazar es simple
- ✅ **Tema claro/oscuro**: Fácil de implementar con CSS variables
- ✅ **Performance**: Tailwind v4 es más rápido que v3

## 📚 Recursos Adicionales

- [Documentación oficial Tailwind v4](https://tailwindcss.com/docs/v4-beta)
- [Migración de v3 a v4](https://tailwindcss.com/docs/v4-beta#migrating-from-v3)
