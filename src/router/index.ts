import { createRouter, createWebHistory } from 'vue-router'
import ListasView from '../views/ListasView.vue'
import ProductosView from '../views/ProductosView.vue'
import DespensaView from '../views/DespensaView.vue'
import HistorialView from '../views/HistorialView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/listas',
      name: 'listas',
      component: ListasView,
    },
    {
      path: '/productos',
      name: 'productos',
      component: ProductosView,
    },
    {
      path: '/despensa',
      name: 'despensa',
      component: DespensaView,
    },
    {
      path: '/historial',
      name: 'historial',
      component: HistorialView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

export default router
