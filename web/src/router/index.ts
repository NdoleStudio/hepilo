import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import ShoppingList from "@/views/ShoppingList.vue";
import Login from "@/views/Login.vue";
import { getCurrentUser } from "@/plugins/firebase";
import store from "@/store";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

export const ROUTE_NAMES = {
  SHOPPING_LIST: "ShoppingList",
  LOGIN: "Login",
  HOME: "Home",
};

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: ROUTE_NAMES.HOME,
    component: Home,
    meta: {
      guest: true,
    },
  },
  {
    path: "/shopping-list",
    name: ROUTE_NAMES.SHOPPING_LIST,
    component: ShoppingList,
    meta: {
      auth: true,
    },
  },
  {
    path: "/login",
    name: ROUTE_NAMES.LOGIN,
    component: Login,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, from, next) => {
  await store.dispatch("setLoading", true);
  const user = await getCurrentUser();

  const requiresAuth = to.matched.some((record) => record.meta.auth);
  if (requiresAuth && !user) {
    next({ name: ROUTE_NAMES.LOGIN });
    return;
  }

  const requiresGuest = to.matched.some((record) => record.meta.guest);
  if (requiresGuest && user) {
    next({ name: ROUTE_NAMES.SHOPPING_LIST });
    return;
  }

  next();
});

router.afterEach(async () => {
  await store.dispatch("setLoading", false);
});

export default router;
