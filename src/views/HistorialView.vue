<template>
  <div class="historial-view">
    <header class="page-header">
      <h1>Historial de Compras</h1>
      <p class="page-description">Revisa el historial de tus compras anteriores</p>
    </header>

    <div class="historial-filters">
      <div class="date-range">
        <label>Período:</label>
        <select class="date-select">
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="quarter">Últimos 3 meses</option>
          <option value="year">Último año</option>
          <option value="all">Todo el historial</option>
        </select>
      </div>
      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar en historial..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div class="historial-stats">
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <h3>0</h3>
          <p>Compras realizadas</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>$0</h3>
          <p>Total gastado</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>0</h3>
          <p>Productos comprados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>$0</h3>
          <p>Promedio por compra</p>
        </div>
      </div>
    </div>

    <div class="historial-container">
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No hay historial de compras</h3>
        <p>Una vez que completes tus primeras listas de compras, aparecerán aquí para que puedas revisarlas</p>
        <button class="btn-secondary" @click="$router.push('/listas')">
          <span class="btn-icon">📝</span>
          Crear Primera Lista
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Aquí se implementará la lógica para mostrar el historial de compras
</script>

<style scoped>
.historial-view {
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

.historial-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range label {
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.date-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 180px;
}

.date-select:focus {
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

.historial-stats {
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

.historial-container {
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
  .historial-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-container {
    max-width: none;
  }

  .historial-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .stat-card {
    padding: 16px;
  }
}
</style>
