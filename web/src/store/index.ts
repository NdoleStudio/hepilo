import Vue from "vue";
import Vuex from "vuex";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

Vue.use(Vuex);

const COLLECTION_STATE = "states";

interface State {
  loading: boolean;
  loadingState: boolean;
  saving: boolean;
  title: string;
  user: User | null;
  list: Array<ListItem>;
  categories: Array<Category>;
  items: Array<Item>;
  currency: string;
  notification: Notification;
}

type NotificationType = "error" | "success";

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

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ListItem {
  itemId: string;
  notes: string;
  quantity: number;
}

export interface MaterializedListItem {
  item: Item;
  listItem: ListItem;
}

export type MaterializedList = Array<{
  category: Category;
  items: Array<MaterializedListItem>;
}>;

export interface UpdateItemRequest {
  name: string;
  categoryId: string;
  pricePerUnit: number;
  quantity: number;
  notes: string;
  itemId: string;
}

export const categoryIdUncategorized = "uncategorized";

export default new Vuex.Store({
  state: {
    loading: false,
    loadingState: false,
    saving: false,
    user: null,
    title: "",
    categories: [
      { id: categoryIdUncategorized, name: "Uncategorized", color: "teal" },
    ],
    items: [],
    currency: "EUR",
    list: [],
    notification: {
      active: false,
      message: "",
      type: "success",
      timeout: 3000,
    },
  },
  mutations: {
    setLoading(state: State, loading: boolean) {
      state.loading = loading;
    },
    setLoadingState(state: State, loading: boolean) {
      state.loadingState = loading;
    },
    setTitle(state: State, title: string) {
      state.title = title;
    },
    setSaving(state: State, saving: boolean) {
      state.saving = saving;
    },
    setNotification(
      state: State,
      notification: { message: string; type: NotificationType }
    ) {
      state.notification = {
        ...state.notification,
        active: true,
        message: notification.message,
        type: notification.type,
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
      const index = state.list.findIndex(
        (value: ListItem) => value.itemId === item.itemId
      );
      if (index === -1) {
        state.list.push(item);
        return;
      }
      state.list[index] = item;
      state.list = [...state.list];
    },

    updateListItemId(
      state: State,
      input: { oldItemId: string; newItemId: string }
    ) {
      state.list = state.list.map((item: ListItem) => {
        if (item.itemId !== input.oldItemId) {
          return item;
        }
        item.itemId = input.newItemId;
        return item;
      });
    },

    deleteListItem(state: State, itemId: string) {
      state.list = state.list.filter((item: ListItem) => {
        return item.itemId != itemId;
      });
    },
    setUser(state: State, user: User | null) {
      state.user = user;
    },
    setState(
      state: State,
      payload: {
        list: Array<ListItem>;
        categories: Array<Category>;
        items: Array<Item>;
        currency: string;
      }
    ) {
      state.list = payload.list;
      state.categories = payload.categories;
      state.items = payload.items;
      state.currency = payload.currency;
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

    async deleteListItem({ commit, getters }, itemId: string) {
      commit("deleteListItem", itemId);
      if (!getters.isLoggedIn) {
        return;
      }

      commit("setSaving", true);
      await setDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id),
        {
          list: getters.list,
        },
        { merge: true }
      );
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
          quantity: 1,
        };
        await commit("upsertListItem", listItem);
      }

      if (getters.user !== null) {
        await setDoc(
          doc(getFirestore(), COLLECTION_STATE, getters.user.id),
          {
            list: getters.list,
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
          list: getters.list,
          categories: getters.categories,
          items: getters.items,
        },
        { merge: true }
      );
      commit("setSaving", false);
    },

    async loadState({ commit, getters }) {
      if (getters.user === null) {
        return;
      }

      await commit("setLoadingState", true);
      const stateSnapshot = await getDoc(
        doc(getFirestore(), COLLECTION_STATE, getters.user.id)
      );
      if (!stateSnapshot.exists()) {
        await commit("setLoadingState", false);
        return;
      }
      await commit("setState", {
        list: stateSnapshot.data().list ?? getters.list,
        categories: stateSnapshot.data().categories ?? getters.categories,
        items: stateSnapshot.data().items ?? getters.items,
        currency: stateSnapshot.data().currency ?? getters.currency,
      });
      await commit("setLoadingState", false);
    },
  },
  getters: {
    loading(state: State): boolean {
      return state.loading;
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

    list(state: State): Array<ListItem> {
      return state.list;
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
      (state: State) =>
      (itemId: string): boolean => {
        return (
          state.list.find((listItem: ListItem) => {
            return listItem.itemId === itemId;
          }) != undefined
        );
      },

    materializedList(state: State, getters): MaterializedList {
      const list: MaterializedList = [];
      const categories = new Set<string>();
      state.list.forEach((listItem: ListItem) => {
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
          items: state.list
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

    categorySelectItems(state: State): Array<SelectItem> {
      return state.categories.map((category: Category) => {
        return {
          value: category.id,
          text: category.name,
        };
      });
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
