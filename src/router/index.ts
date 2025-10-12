import {
  createRouter,
  createWebHistory,
} from "vue-router";
import { useUserStore } from "@/stores2/user";
import ListasView from "../views/ListasView.vue";
import ProductosView from "../views/ProductosView.vue";
import DespensaView from "../views/DespensaView.vue";
import HistorialView from "../views/HistorialView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL,
  ),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { requiresAuth: false },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPasswordView,
      meta: { requiresAuth: false },
    },
    {
      path: "/listas",
      name: "listas",
      component: ListasView,
      meta: { requiresAuth: true },
    },
    {
      path: "/productos",
      name: "productos",
      component: ProductosView,
      meta: { requiresAuth: true },
    },
    {
      path: "/despensa",
      name: "despensa",
      component: DespensaView,
      meta: { requiresAuth: true },
    },
    {
      path: "/historial",
      name: "historial",
      component: HistorialView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // Initialize store if not done yet (on page refresh)
  if (!userStore.isLoggedIn) {
    userStore.initialize();
  }

  const requiresAuth =
    to.meta.requiresAuth;

  if (
    requiresAuth &&
    !userStore.isLoggedIn
  ) {
    // Redirect to login if trying to access protected route without auth
    next("/login");
  } else if (
    !requiresAuth &&
    userStore.isLoggedIn &&
    (to.path === "/login" ||
      to.path === "/register" ||
      to.path === "/forgot-password")
  ) {
    // Redirect to main app if already logged in and trying to access login/register/forgot-password
    next("/listas");
  } else {
    next();
  }
});

export default router;
