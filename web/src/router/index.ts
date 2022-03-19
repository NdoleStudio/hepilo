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
import ShoppingListDemo from "@/views/ShoppingListDemo.vue";

Vue.use(VueRouter);

export const ROUTE_NAMES = {
  SHOPPING_LIST_SHOW: "ShowShoppingList",
  SHOPPING_LIST_INDEX: "IndexShoppingList",
  MANAGE_LISTS: "ManageLists",
  MANAGE_ITEMS: "ManageItems",
  MANAGE_CATEGORIES: "ManageCategories",
  SETTINGS_INDEX: "IndexSettings",
  PRIVACY_POLICY: "PrivacyPolicy",
  TERMS_AND_CONDITIONS: "TermsAndConditions",
  LOGIN: "Login",
  SHOPPING_LIST_DEMO: "DemoShoppingList",
  HOME: "Home",
  BLOG_INDEX: "BlogIndex",
  BLOG_SHOW: "BlogShow",
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
    path: "/privacy-policy",
    name: ROUTE_NAMES.PRIVACY_POLICY,
    component: () => import("@/views/PrivacyPolicy.vue"),
  },
  {
    path: "/terms-and-conditions",
    name: ROUTE_NAMES.TERMS_AND_CONDITIONS,
    component: () => import("@/views/TermsAndConditions.vue"),
  },
  {
    path: "/lists/:listId",
    name: ROUTE_NAMES.SHOPPING_LIST_SHOW,
    component: ShoppingList,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/lists",
    name: ROUTE_NAMES.SHOPPING_LIST_INDEX,
    component: ShoppingListIndex,
    meta: {
      auth: true,
      showNav: true,
    },
  },
  {
    path: "/demo",
    name: ROUTE_NAMES.SHOPPING_LIST_DEMO,
    component: ShoppingListDemo,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/manage/lists",
    name: ROUTE_NAMES.MANAGE_LISTS,
    component: ManageLists,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/manage/categories",
    name: ROUTE_NAMES.MANAGE_CATEGORIES,
    component: ManageCategories,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/manage/items",
    name: ROUTE_NAMES.MANAGE_ITEMS,
    component: ManageItems,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/settings",
    name: ROUTE_NAMES.SETTINGS_INDEX,
    component: SettingsIndex,
    meta: {
      showNav: true,
    },
  },
  {
    path: "/blog",
    name: ROUTE_NAMES.BLOG_INDEX,
    component: () => import("@/views/BlogIndex.vue"),
  },
  {
    path: "/blog/:slug",
    name: ROUTE_NAMES.BLOG_SHOW,
    component: () => import("@/views/BlogShow.vue"),
  },
  {
    path: "/login",
    name: ROUTE_NAMES.LOGIN,
    component: Login,
  },
  {
    path: "*",
    component: () => import("@/views/NotFound.vue"),
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
