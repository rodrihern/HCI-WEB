<template>
  <div class="listas-view">
    <header class="page-header">
      <h1>Mis Listas de Compras</h1>
      <p class="page-description">Crea y gestiona tus listas de compras</p>
    </header>

    <div class="listas-container">
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No tienes listas de compras aún</h3>
        <p>Crea tu primera lista para comenzar a organizar tus compras</p>
        <button class="btn-primary">
          <span class="btn-icon">+</span>
          Crear Nueva Lista
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Aquí se implementará la lógica para gestionar las listas de compras
</script>

<style scoped>
.listas-view {
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

.listas-container {
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

.btn-icon {
  font-size: 1.2rem;
  font-weight: 300;
}
</style>
