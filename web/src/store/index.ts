import Vue from "vue";
import Vuex from "vuex";
import shortUUID from "short-uuid";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_CURRENCY, getDefaultCurrency } from "@/plugins/intl";
import { mdiDomain, mdiFormatListCheckbox, mdiWeightLifter } from "@mdi/js";

Vue.use(Vuex);

const COLLECTION_STATE = "states";

interface State {
  loading: boolean;
  loadingState: boolean;
  saving: boolean;
  stateLoaded: boolean;
  title: string;
  user: User | null;
  categories: Array<Category>;
  selectedListId: string;
  lists: Array<List>;
  items: Array<Item>;
  currency: string;
  notification: Notification;
  navDrawerOpen: boolean;
}

export const LIST_ICON_DEFAULT = "list";
const LIST_ICONS = new Map<string, string>([
  ["list", mdiFormatListCheckbox],
  ["work", mdiDomain],
  ["fitness", mdiWeightLifter],
]);

const LIST_DEFAULT: List = {
  name: "Shopping List",
  id: shortUUID.generate(),
  items: [],
  cartPanelOpen: true,
  icon: LIST_ICON_DEFAULT,
};

export type List = {
  name: string;
  icon: string;
  id: string;
  cartPanelOpen: boolean;
  items: Array<ListItem>;
};

type NotificationType = "error" | "success" | "info";

export interface Notification {
  message: string;
  timeout: number;
  active: boolean;
  type: NotificationType;
}

export interface User {
  id: string;
  name: string | null;
  photoURL: string | null;
}

export interface SelectItem {
  text: string;
  value: string;
}

interface Item {
  id: string;
  name: string;
  pricePerUnit: number;
  categoryId: string;
}

export type Category = {
  id: string;
  name: string;
  color: string;
};

type ListItem = {
  itemId: string;
  notes: string;
  addedToCart: boolean;
  quantity: number;
};

export interface MaterializedListItem {
  item: Item;
  listItem: ListItem;
}

interface MaterializedListElement {
  category: Category;
  items: Array<MaterializedListItem>;
}

export type MaterializedList = Array<MaterializedListElement>;

export interface UpsertListRequest {
  id: string;
  name: string;
  icon: string;
}

export interface UpdateItemRequest {
  name: string;
  categoryId: string;
  pricePerUnit: number;
  quantity: number;
  addedToCart: boolean;
  notes: string;
  itemId: string;
}

export interface NotificationRequest {
  message: string;
  type: NotificationType;
}

export const categoryIdUncategorized = "uncategorized";
const defaultNotificationTimeout = 3000;
const defaultCategory: Category = {
  id: categoryIdUncategorized,
  name: "Uncategorized",
  color: "teal",
};

export default new Vuex.Store({
  state: {
    loading: false,
    loadingState: false,
    stateLoaded: false,
    saving: false,
    user: null,
    title: "",
    categories: [defaultCategory],
    items: [],
    currency: DEFAULT_CURRENCY,
    lists: [],
    selectedListId: "",
    notification: {
      active: false,
      message: "",
      type: "success",
      timeout: 3000,
    },
    navDrawerOpen: false,
  },
  mutations: {
    setLoading(state: State, loading: boolean) {
      state.loading = loading;
    },
    setSelectedListId(state: State, listId: string) {
      state.selectedListId = listId;
    },
    setLoadingState(state: State, loading: boolean) {
      state.loadingState = loading;
    },
    setTitle(state: State, title: string) {
      state.title = title;
    },
    upsertList(state: State, list: List) {
      const index = state.lists.findIndex(
        (value: List) => value.id === list.id
      );
      if (index === -1) {
        state.lists.push(list);
        return;
      }
      state.lists[index] = list;
      state.lists = [...state.lists];
    },
    setSaving(state: State, saving: boolean) {
      state.saving = saving;
    },
    toggleCartPanel(state: State) {
      const listIndex = state.lists.findIndex(
        (list) => list.id === state.selectedListId
      );
      state.lists[listIndex].cartPanelOpen =
        !state.lists[listIndex].cartPanelOpen;
      state.lists = [...state.lists];
    },
    setNavDrawer(state: State, isOpen: boolean) {
      state.navDrawerOpen = isOpen;
    },
    setNotification(state: State, notification: NotificationRequest) {
      state.notification = {
        ...state.notification,
        active: true,
        message: notification.message,
        type: notification.type,
        timeout: Math.floor(Math.random() * 100) + defaultNotificationTimeout, // Reset the timeout
      };
    },
    disableNotification(state: State) {
      state.notification.active = false;
    },
    upsertCategory(state: State, category: Category) {
      const index = state.categories.findIndex(
        (value: Category) => value.id === category.id
      );
      if (index === -1) {
        state.categories.push(category);
        return;
      }
      state.categories[index] = category;
      state.categories = [...state.categories];
    },
    upsertItem(state: State, item: Item) {
      const index = state.items.findIndex(
        (value: Item) => value.id === item.id
      );
      if (index === -1) {
        state.items.push(item);
        return;
      }
      state.items[index] = item;
      state.items = [...state.items];
    },

    upsertListItem(state: State, item: ListItem) {
      const listIndex = state.lists.findIndex(
        (list) => list.id === state.selectedListId
      );

      const index = state.lists[listIndex].items.findIndex(
        (value: ListItem) => value.itemId === item.itemId
      );
      if (index === -1) {
        state.lists[listIndex].items.push(item);
        state.lists = [...state.lists];
        return;
      }
      state.lists[listIndex].items[index] = item;
      state.lists = [...state.lists];
    },

    updateListItemId(
      state: State,
      input: { oldItemId: string; newItemId: string }
    ) {
      const listIndex = state.lists.findIndex(
        (list) => list.id === state.selectedListId
      );
      state.lists[listIndex].items = state.lists[listIndex].items.map(
        (item: ListItem) => {
          if (item.itemId !== input.oldItemId) {
            return item;
          }
          item.itemId = input.newItemId;
          return item;
        }
      );
      state.lists = [...state.lists];
    },

    setAddedToCart(
      state: State,
      input: { itemId: string; addedToCart: boolean }
    ) {
      const listIndex = state.lists.findIndex(
        (list) => list.id === state.selectedListId
      );
      state.lists[listIndex].items = state.lists[listIndex].items.map(
        (item: ListItem) => {
          if (item.itemId === input.itemId) {
            item.addedToCart = input.addedToCart;
          }
          return item;
        }
      );
      state.lists = [...state.lists];
    },

    deleteList(state: State, listId: string) {
      state.lists = state.lists.filter((list: List) => {
        return list.id !== listId;
      });
    },

    deleteListItem(state: State, itemId: string) {
      const listIndex = state.lists.findIndex(
        (list) => list.id === state.selectedListId
      );
      state.lists[listIndex].items = state.lists[listIndex].items.filter(
        (item: ListItem) => {
          return item.itemId != itemId;
        }
      );
      state.lists = [...state.lists];
    },
    setUser(state: State, user: User | null) {
      state.user = user;
    },
    setCurrency(state: State, currency: string) {
      state.currency = currency;
    },
    setState(
      state: State,
      payload: {
        lists: Array<List>;
        selectedListId: string;
        categories: Array<Category>;
        items: Array<Item>;
        stateLoaded: boolean;
        currency: string;
        navDrawerOpen: boolean;
      }
    ) {
      state.lists = payload.lists;
      state.selectedListId = payload.selectedListId;
      state.categories = payload.categories;
      state.items = payload.items;
      state.stateLoaded = payload.stateLoaded;
      state.currency = payload.currency;
      state.navDrawerOpen = payload.navDrawerOpen;
    },
  },
  actions: {
    async setLoading({ commit }, loading: boolean) {
      await commit("setLoading", loading);
    },

    setUser({ commit, getters }, user: User | null) {
      if (getters.user === user) {
        return;
      }
      commit("setUser", user);
    },
    setTitle({ commit }, title: string) {
      commit("setTitle", title);
    },

    async setNavDrawer({ commit, getters }, state: boolean) {
      await commit("setNavDrawer", state);
      if (!getters.isLoggedIn) {
        return;
      }

      await setDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id),
        {
          navDrawerOpen: getters.navDrawerOpen,
        },
        { merge: true }
      );
    },

    async toggleCartPanel({ commit, getters }) {
      await commit("toggleCartPanel");
      if (!getters.isLoggedIn) {
        return;
      }

      await setDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id),
        {
          lists: getters.lists,
        },
        { merge: true }
      );
    },

    async deleteListItem({ commit, getters }, itemId: string) {
      commit("deleteListItem", itemId);
      if (!getters.isLoggedIn) {
        return;
      }

      commit("setSaving", true);
      await setDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id),
        {
          lists: getters.lists,
        },
        { merge: true }
      );
      commit("setSaving", false);
    },

    async deleteList({ commit, getters, dispatch }, listId: string) {
      commit("setSaving", true);
      if (getters.lists.length < 2) {
        commit("setNotification", {
          type: "error",
          message: `You cannot delete the only list`,
        });
        commit("setSaving", false);
        return;
      }

      const list = getters.listById(listId);

      if (getters.selectedListId == listId) {
        await commit(
          "setSelectedListId",
          getters.lists.find((list: List) => list.id !== listId).id
        );
      }

      await commit("deleteList", listId);
      await dispatch("sanitizeState");

      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            lists: getters.lists,
          },
          { merge: true }
        );
      }

      commit("setNotification", {
        type: "info",
        message: `${list?.name ?? "List"} has been deleted successfully`,
      });
      commit("setSaving", false);
    },

    setTitleByListId({ commit, getters }, listId: string) {
      const list = getters.listById(listId);
      if (list) {
        commit("setTitle", list.name);
      }
    },

    async setSelectedListId({ commit, getters }, listId: string) {
      if (getters.listExists(listId)) {
        commit("setSelectedListId", listId);
      }
      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            selectedListId: listId,
          },
          { merge: true }
        );
      }
    },
    async upsertList({ commit, getters }, request: UpsertListRequest) {
      commit("setSaving", true);

      let list = getters.listById(request.id);
      if (list === undefined) {
        list = {
          name: request.name,
          items: [],
          cartPanelOpen: true,
          id: request.id,
          icon: request.icon,
        };
      }

      list.icon = request.icon;
      list.name = request.name;

      await commit("upsertList", list);

      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            lists: getters.lists,
          },
          { merge: true }
        );
      }

      commit("setNotification", {
        type: "success",
        message: `${request.name} has been added successfully`,
      });

      commit("setSaving", false);
    },

    async addItem({ commit, getters }, name: string) {
      commit("setSaving", true);
      if (!getters.hasItem(name)) {
        const item: Item = {
          id: getters.nameToId(name),
          name: name.trim(),
          pricePerUnit: 0,
          categoryId: getters.findCategoryByItemId(getters.nameToId),
        };
        await commit("upsertItem", item);
      }

      if (!getters.listHasItemId(getters.nameToId(name))) {
        const listItem: ListItem = {
          itemId: getters.nameToId(name),
          notes: "",
          addedToCart: false,
          quantity: 1,
        };
        await commit("upsertListItem", listItem);
      }

      if (getters.ItemIdIsInCart(getters.nameToId(name))) {
        await commit("setAddedToCart", {
          itemId: getters.nameToId(name),
          addedToCart: false,
        });
      }

      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            lists: getters.lists,
            categories: getters.categories,
            items: getters.items,
          },
          { merge: true }
        );
      }

      commit("setNotification", {
        type: "success",
        message: `${name} has been added successfully`,
      });

      commit("setSaving", false);
    },

    disableNotification({ commit }) {
      commit("disableNotification");
    },
    async updateItem({ commit, getters }, request: UpdateItemRequest) {
      commit("setSaving", true);
      const item: Item = {
        id: getters.nameToId(request.name),
        name: request.name.trim(),
        pricePerUnit: request.pricePerUnit,
        categoryId: request.categoryId,
      };
      await commit("upsertItem", item);

      const listItem: ListItem = {
        itemId: request.itemId,
        notes: request.notes,
        addedToCart: request.addedToCart,
        quantity: request.quantity,
      };
      await commit("upsertListItem", listItem);

      if (getters.nameToId(request.name) !== request.itemId) {
        await commit("updateListItemId", {
          oldItemId: request.itemId,
          newItemId: getters.nameToId(request.name),
        });
      }

      if (getters.user === null) {
        commit("setSaving", false);
        return;
      }

      await setDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id),
        {
          lists: getters.lists,
          categories: getters.categories,
          items: getters.items,
        },
        { merge: true }
      );
      commit("setSaving", false);
    },

    async addToCart({ commit, getters }, itemId: string) {
      commit("setSaving", true);

      await commit("setAddedToCart", {
        itemId: itemId,
        addedToCart: true,
      });

      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            lists: getters.lists,
          },
          { merge: true }
        );
      }

      const item = getters.findItemById(itemId);
      if (item) {
        commit("setNotification", {
          type: "success",
          message: `${item.name} added to cart`,
        });
      }

      commit("setSaving", false);
    },

    async removeFromCart({ commit, getters }, itemId: string) {
      commit("setSaving", true);

      await commit("setAddedToCart", {
        itemId: itemId,
        addedToCart: false,
      });

      if (getters.isLoggedIn) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            lists: getters.lists,
          },
          { merge: true }
        );
      }

      const item = getters.findItemById(itemId);
      if (item) {
        commit("setNotification", {
          type: "success",
          message: `${item.name} removed from cart`,
        });
      }

      commit("setSaving", false);
    },

    addNotification({ commit }, request: NotificationRequest) {
      commit("setNotification", request);
    },

    async sanitizeState({ commit, getters }) {
      let lists = [...getters.lists];
      let selectedListId = getters.selectedListId;

      // Create default list if not exists
      if (!getters.selectedListIsValid) {
        if (lists.length > 0) {
          selectedListId = lists[0].id;
        } else {
          lists.push(LIST_DEFAULT);
          selectedListId = LIST_DEFAULT.id;
        }
      }

      // Sanitize icon names
      lists = lists.map((list) => {
        if (!LIST_ICONS.has(list.icon)) {
          list.icon = LIST_ICON_DEFAULT;
        }
        return list;
      });

      await commit("setState", {
        lists,
        selectedListId,
        categories: getters.categories,
        items: getters.items,
        currency: getters.currency,
        stateLoaded: true,
        navDrawerOpen: getters.navDrawerOpen,
        cartPanelOpen: getters.cartPanelOpen,
      });
    },

    async loadState({ commit, getters, dispatch }) {
      if (getters.stateLoaded) {
        return;
      }

      if (getters.user === null) {
        await commit("setCurrency", await getDefaultCurrency());
        await dispatch("sanitizeState");
        return;
      }

      await commit("setLoadingState", true);

      const stateSnapshot = await getDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id)
      );

      if (!stateSnapshot.exists()) {
        await commit("setCurrency", await getDefaultCurrency());
        await dispatch("sanitizeState");
        await commit("setLoadingState", false);
        return;
      }

      await commit("setState", {
        lists: stateSnapshot.data().lists ?? getters.lists,
        categories: stateSnapshot.data().categories ?? [defaultCategory],
        items: stateSnapshot.data().items ?? getters.items,
        currency: stateSnapshot.data().currency ?? (await getDefaultCurrency()),
        selectedListId:
          stateSnapshot.data().selectedListId ?? getters.selectedListId,
        stateLoaded: false,
        navDrawerOpen:
          stateSnapshot.data().navDrawerOpen ?? getters.navDrawerOpen,
        cartPanelOpen:
          stateSnapshot.data().cartPanelOpen ?? getters.cartPanelOpen,
      });

      await dispatch("sanitizeState");
      await commit("setLoadingState", false);
    },

    resetState({ commit, getters }) {
      commit("setState", {
        lists: [],
        categories: [defaultCategory],
        items: [],
        currency: getters.currency,
        stateLoaded: false,
        navDrawerOpen: false,
      });
    },
  },
  getters: {
    loading(state: State): boolean {
      return state.loading;
    },

    stateLoaded(state: State): boolean {
      return state.stateLoaded;
    },

    categories(state: State): Array<Category> {
      return state.categories;
    },

    loadingState(state: State): boolean {
      return state.loadingState;
    },

    items(state: State): Array<Item> {
      return state.items;
    },

    navDrawerOpen(state: State): boolean {
      return state.navDrawerOpen;
    },

    cartPanelOpen(state: State, getters): boolean {
      return getters.selectedList.cartPanelOpen;
    },

    cartPanel(state: State, getters): number {
      if (getters.selectedList.cartPanelOpen) {
        return 0;
      }
      return -1;
    },

    selectedList(state: State): List {
      const selectedList = state.lists.find(
        (list) => list.id === state.selectedListId
      );
      if (selectedList == undefined && !state.stateLoaded) {
        return LIST_DEFAULT;
      }

      if (selectedList == undefined) {
        console.error(
          `cannot fetch selected list with id: ${state.selectedListId}`
        );
        return LIST_DEFAULT;
      }
      return selectedList;
    },

    saving(state: State): boolean {
      return state.saving;
    },

    user(state: State): User | null {
      return state.user;
    },

    hasProfilePicture(state: State): boolean {
      return state.user !== null && state.user.photoURL !== null;
    },

    isLoggedIn(state: State): boolean {
      return state.user !== null;
    },

    title(state: State): string {
      return state.title;
    },

    nameToId:
      () =>
      (name: string): string => {
        return name.trim().toLowerCase();
      },

    hasItem:
      (state: State, getters) =>
      (name: string): boolean => {
        return getters.itemByName(name) != undefined;
      },

    listHasItemId:
      (state: State, getters) =>
      (itemId: string): boolean => {
        return (
          getters.selectedList.items.find((listItem: ListItem) => {
            return listItem.itemId === itemId;
          }) != undefined
        );
      },

    ItemIdIsInCart:
      (state: State, getters) =>
      (itemId: string): boolean => {
        return (
          getters.selectedList.items.find((listItem: ListItem) => {
            return listItem.itemId === itemId && listItem.addedToCart;
          }) != undefined
        );
      },

    cartMaterializedItems(state: State, getters): MaterializedList {
      return getters.materializedList(true);
    },

    listMaterializedItems(state: State, getters): MaterializedList {
      return getters.materializedList(false);
    },

    materializedList:
      (state: State, getters) =>
      (addedToCart: boolean): MaterializedList => {
        const list: MaterializedList = [];
        const categories = new Set<string>();

        if (getters.lists.length === 0) {
          return list;
        }

        const items = getters.selectedList.items.filter(
          (listItem: ListItem) => {
            if (addedToCart) {
              return listItem.addedToCart;
            }
            return !listItem.addedToCart;
          }
        );

        items.forEach((listItem: ListItem) => {
          const item = getters.findItemById(listItem.itemId);
          if (item === undefined) {
            return;
          }

          const category = getters.findCategoryById(item.categoryId);
          if (category === undefined) {
            return;
          }
          categories.add(category.name);
        });

        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach((categoryName: string) => {
          const category = getters.findCategoryByName(categoryName);
          if (category === undefined) {
            return;
          }
          list.push({
            category,
            items: items
              .filter((listItem: ListItem) => {
                const item = getters.findItemById(listItem.itemId);
                if (item == undefined) {
                  return false;
                }
                const itemCategory = getters.findCategoryById(item.categoryId);
                if (itemCategory == undefined) {
                  return false;
                }
                return itemCategory.id == category.id;
              })
              .map((listItem: ListItem) => {
                return {
                  listItem,
                  item: getters.findItemById(listItem.itemId),
                };
              })
              .sort((a: MaterializedListItem, b: MaterializedListItem) =>
                a.item.name.localeCompare(b.item.name)
              ),
          });
        });
        return list;
      },

    findCategoryById:
      (state: State) =>
      (categoryId: string): Category | undefined => {
        return state.categories.find((category: Category) => {
          return category.id === categoryId;
        });
      },

    findCategoryByItemId:
      (state: State, getters) =>
      (itemId: string): string => {
        const item = getters.findItemById(itemId);
        if (item !== undefined) {
          return item.categoryId;
        }
        return categoryIdUncategorized;
      },

    findCategoryByName:
      (state: State, getters) =>
      (categoryName: string): Category | undefined => {
        return state.categories.find((category: Category) => {
          return category.id === getters.nameToId(categoryName);
        });
      },

    findItemById:
      (state: State) =>
      (id: string): Item | undefined => {
        return state.items.find((item: Item) => {
          return item.id == id;
        });
      },

    itemByName:
      (state: State, getters) =>
      (name: string): Item | undefined => {
        return state.items.find((item: Item) => {
          return item.id == getters.nameToId(name);
        });
      },

    currency(state: State): string {
      return state.currency;
    },

    notification(state: State): Notification {
      return state.notification;
    },

    selectedListId(state: State): string {
      return state.selectedListId;
    },

    selectedListIsValid(state: State): boolean {
      return (
        state.lists.find((list) => list.id === state.selectedListId) !==
        undefined
      );
    },

    lists(state: State): Array<List> {
      return state.lists;
    },

    currencySymbol(state: State): string {
      return (
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: state.currency,
        })
          .formatToParts(0.0)
          .find((part) => {
            return part.type == "currency";
          })?.value || "$"
      );
    },

    listTotal(state: State, getters): number {
      return getters.listMaterializedItems.reduce(
        (sum: number, item: MaterializedListElement) => {
          return (
            sum +
            item.items.reduce((value: number, item: MaterializedListItem) => {
              return value + item.item.pricePerUnit * item.listItem.quantity;
            }, 0)
          );
        },
        0
      );
    },

    listById:
      (state: State) =>
      (listId: string): List | undefined => {
        return state.lists.find((list) => list.id === listId);
      },

    listExists: (state: State, getters) => (listId: string) => {
      return getters.listById(listId) !== undefined;
    },

    listIcon: () => (name: string) => {
      if (LIST_ICONS.has(name)) {
        return LIST_ICONS.get(name);
      }
      return LIST_ICONS.get(LIST_ICON_DEFAULT);
    },

    cartTotal(state: State, getters): number {
      return getters.cartMaterializedItems.reduce(
        (sum: number, item: MaterializedListElement) => {
          return (
            sum +
            item.items.reduce((value: number, item: MaterializedListItem) => {
              return value + item.item.pricePerUnit * item.listItem.quantity;
            }, 0)
          );
        },
        0
      );
    },

    categorySelectItems(state: State): Array<SelectItem> {
      return state.categories.map((category: Category) => {
        return {
          value: category.id,
          text: category.name,
        };
      });
    },

    listIconSelectItems(): Array<SelectItem> {
      const items: Array<SelectItem> = [];
      LIST_ICONS.forEach((key, value) => {
        items.push({
          value: value,
          text: value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase(),
        });
      });
      return items;
    },

    autocompleteItems(state: State, getters): Array<SelectItem> {
      return state.items
        .filter((item: Item) => !getters.listHasItemId(item.id))
        .map((item: Item) => {
          return {
            value: item.name,
            text: item.name,
          };
        });
    },
  },
});
