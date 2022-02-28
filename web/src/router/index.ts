import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import ShoppingList from "@/views/ShoppingList.vue";
import Login from "@/views/Login.vue";
import { getCurrentUser } from "@/plugins/firebase";
import store from "@/store";
import Home from "@/views/Home.vue";
import ShoppingListIndex from "@/views/ShoppingListIndex.vue";
import ManageLists from "@/views/ManageLists.vue";
import ManageCategories from "@/views/ManageCategories.vue";
import ManageItems from "@/views/ManageItems.vue";
import SettingsIndex from "@/views/SettingsIndex.vue";

Vue.use(VueRouter);

export const ROUTE_NAMES = {
  SHOPPING_LIST_SHOW: "ShowShoppingList",
  SHOPPING_LIST_INDEX: "IndexShoppingList",
  MANAGE_LISTS: "ManageLists",
  MANAGE_ITEMS: "ManageItems",
  MANAGE_CATEGORIES: "ManageCategories",
  SETTINGS_INDEX: "IndexSettings",
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
    path: "/manage/lists",
    name: ROUTE_NAMES.MANAGE_LISTS,
    component: ManageLists,
    meta: {
      auth: true,
    },
  },
  {
    path: "/manage/categories",
    name: ROUTE_NAMES.MANAGE_CATEGORIES,
    component: ManageCategories,
    meta: {
      auth: true,
    },
  },
  {
    path: "/manage/items",
    name: ROUTE_NAMES.MANAGE_ITEMS,
    component: ManageItems,
    meta: {
      auth: true,
    },
  },
  {
    path: "/settings",
    name: ROUTE_NAMES.SETTINGS_INDEX,
    component: SettingsIndex,
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
