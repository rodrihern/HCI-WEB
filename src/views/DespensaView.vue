<template>
  <div class="despensa-view">
    <header class="page-header">
      <h1>Mi Despensa</h1>
      <p class="page-description">Controla el inventario de productos en tu despensa</p>
    </header>

    <div class="despensa-stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>0</h3>
          <p>Productos totales</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <h3>0</h3>
          <p>Productos por agotar</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>0</h3>
          <p>Próximos a vencer</p>
        </div>
      </div>
    </div>

    <div class="despensa-actions">
      <div class="filter-container">
        <select class="filter-select">
          <option value="all">Todos los productos</option>
          <option value="low-stock">Stock bajo</option>
          <option value="expiring">Próximos a vencer</option>
          <option value="expired">Vencidos</option>
        </select>
      </div>
      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar en despensa..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      <button class="btn-primary">
        <span class="btn-icon">+</span>
        Agregar a Despensa
      </button>
    </div>

    <div class="despensa-container">
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <h3>Tu despensa está vacía</h3>
        <p>Comienza a agregar productos para llevar un control de tu inventario doméstico</p>
        <button class="btn-secondary">
          <span class="btn-icon">+</span>
          Agregar Primer Producto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Aquí se implementará la lógica para gestionar la despensa
</script>

<style scoped>
.despensa-view {
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

.despensa-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 2rem;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.stat-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.despensa-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-container {
  min-width: 200px;
}

.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.despensa-container {
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
  .despensa-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-container,
  .search-container {
    max-width: none;
  }

  .despensa-stats {
    grid-template-columns: 1fr;
  }
}
</style>
