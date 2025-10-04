<template>
  <div class="productos-view">
    <header class="page-header">
      <h1>Catálogo de Productos</h1>
      <p class="page-description">Gestiona tu catálogo personal de productos</p>
    </header>

    <div class="productos-actions">
      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar productos..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      <button class="btn-primary">
        <span class="btn-icon">+</span>
        Agregar Producto
      </button>
    </div>

    <div class="productos-container">
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No tienes productos en tu catálogo</h3>
        <p>Agrega productos para poder crear listas de compras más rápidamente</p>
        <button class="btn-secondary">
          <span class="btn-icon">+</span>
          Agregar Primer Producto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Aquí se implementará la lógica para gestionar el catálogo de productos
</script>

<style scoped>
.productos-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.productos-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: space-between;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.productos-container {
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: 300;
}

@media (max-width: 768px) {
  .productos-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }
}
</style>
