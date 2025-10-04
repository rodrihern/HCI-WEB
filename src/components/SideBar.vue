<template>
  <nav class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <span class="logo__icon">🛒</span>
        <h2 v-if="!isCollapsed" class="logo__text">Listazo</h2>
      </div>
      <button
        class="sidebar__toggle"
        @click="toggleSidebar"
        :title="isCollapsed ? 'Expandir menú' : 'Contraer menú'"
      >
        <span class="toggle__icon">{{ isCollapsed ? '→' : '←' }}</span>
      </button>
    </div>

    <ul class="sidebar__menu">
      <li class="menu__item">
        <router-link to="/listas" class="menu__link" active-class="menu__link--active">
          <span class="menu__icon">📝</span>
          <span v-if="!isCollapsed" class="menu__text">Listas</span>
        </router-link>
      </li>
      <li class="menu__item">
        <router-link to="/productos" class="menu__link" active-class="menu__link--active">
          <span class="menu__icon">📦</span>
          <span v-if="!isCollapsed" class="menu__text">Productos</span>
        </router-link>
      </li>
      <li class="menu__item">
        <router-link to="/despensa" class="menu__link" active-class="menu__link--active">
          <span class="menu__icon">🏠</span>
          <span v-if="!isCollapsed" class="menu__text">Despensa</span>
        </router-link>
      </li>
      <li class="menu__item">
        <router-link to="/historial" class="menu__link" active-class="menu__link--active">
          <span class="menu__icon">📜</span>
          <span v-if="!isCollapsed" class="menu__text">Historial</span>
        </router-link>
      </li>
    </ul>

    <div class="sidebar__footer">
      <div class="footer__user" v-if="!isCollapsed">
        <div class="user__avatar">👤</div>
        <div class="user__info">
          <p class="user__name">Usuario</p>
          <p class="user__email">usuario@email.com</p>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar--collapsed {
  width: 80px;
}

.sidebar__header {
  padding: 24px 20px;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo__icon {
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 8px;
}

.logo__text {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
  white-space: nowrap;
}

.sidebar__toggle {
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar__toggle:hover {
  background: #374151;
  color: white;
  border-color: #4b5563;
}

.toggle__icon {
  font-size: 1rem;
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

.sidebar__menu {
  flex: 1;
  list-style: none;
  padding: 16px 0;
  margin: 0;
}

.menu__item {
  margin: 4px 0;
}

.menu__link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 0;
  position: relative;
}

.menu__link:hover {
  background: #374151;
  color: white;
}

.menu__link--active {
  background: #3b82f6;
  color: white;
}

.menu__link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #60a5fa;
}

.menu__icon {
  font-size: 1.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu__text {
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar__footer {
  border-top: 1px solid #374151;
  padding: 20px;
}

.footer__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user__avatar {
  width: 40px;
  height: 40px;
  background: #374151;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user__info {
  flex: 1;
  min-width: 0;
}

.user__name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user__email {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar--collapsed {
    width: 100%;
  }
}

/* Tablet adjustments */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: 240px;
  }

  .sidebar--collapsed {
    width: 70px;
  }

  .sidebar__header {
    padding: 20px 16px;
  }

  .menu__link {
    padding: 14px 16px;
  }
}
</style>
