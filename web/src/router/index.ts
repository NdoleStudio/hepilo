import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import ShoppingList from "@/views/ShoppingList.vue";
import Login from "@/views/Login.vue";
import { getCurrentUser } from "@/plugins/firebase";
import store from "@/store";
import Home from "@/views/Home.vue";
import ShoppingListIndex from "@/views/ShoppingListIndex.vue";

Vue.use(VueRouter);

export const ROUTE_NAMES = {
  SHOPPING_LIST_SHOW: "ShowShoppingList",
  SHOPPING_LIST_INDEX: "IndexShoppingList",
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
    path: "/lists/:listId",
    name: ROUTE_NAMES.SHOPPING_LIST_SHOW,
    component: ShoppingList,
    meta: {
      auth: true,
    },
  },
  {
    path: "/lists",
    name: ROUTE_NAMES.SHOPPING_LIST_INDEX,
    component: ShoppingListIndex,
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
    next({ name: ROUTE_NAMES.SHOPPING_LIST_INDEX });
    return;
  }

  next();
});

router.afterEach(async () => {
  await store.dispatch("setLoading", false);
});

export default router;
