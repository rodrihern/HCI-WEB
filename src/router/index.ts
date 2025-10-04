import { createRouter, createWebHistory } from "vue-router";
import ListasView from "@/views/ListasView.vue";
import ProductosView from "@/views/ProductosView.vue";
import DespensaView from "@/views/DespensaView.vue";
import HistorialView from "@/views/HistorialView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/listas",
    },
    {
      path: "/listas",
      name: "listas",
      component: ListasView,
    },
    {
      path: "/productos",
      name: "productos",
      component: ProductosView,
    },
    {
      path: "/despensa",
      name: "despensa",
      component: DespensaView,
    },
    {
      path: "/historial",
      name: "historial",
      component: HistorialView,
    },
  ],
});

export default router;
