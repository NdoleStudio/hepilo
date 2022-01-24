import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface State {
  loading: boolean;
  title: string;
  list: Array<ListItem>;
  categories: Array<Category>;
  items: Array<Item>;
  currency: string;
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
}

interface ListItem {
  itemId: string;
  notes: string;
  quantity: number;
}

export type MaterializedList = Array<{
  category: Category;
  items: Array<{ item: Item; listItem: ListItem }>;
}>;

const categoryIdUncategorized = "uncategorized";

export default new Vuex.Store({
  state: {
    loading: false,
    title: "",
    categories: [{ id: categoryIdUncategorized, name: "Uncategorized" }],
    items: [],
    currency: "EUR",
    list: [],
  },
  mutations: {
    setLoading(state: State, loading: boolean) {
      state.loading = loading;
    },

    setTitle(state: State, title: string) {
      state.title = title;
    },
    addCategory(state: State, category: Category) {
      state.categories.push(category);
    },
    addItem(state: State, item: Item) {
      state.items.push(item);
    },
    addItemToList(state: State, item: ListItem) {
      state.list.push(item);
    },
    deleteListItem(state: State, itemId: string) {
      state.list = state.list.filter((item: ListItem) => {
        return item.itemId != itemId;
      });
    },
  },
  actions: {
    setLoading({ commit }, loading: boolean) {
      commit("setLoading", loading);
    },

    setTitle({ commit }, title: string) {
      commit("setTitle", title);
    },

    deleteListItem({ commit }, itemId: string) {
      commit("deleteListItem", itemId);
    },

    addItem({ commit, getters }, name: string) {
      // fetch or add item
      if (!getters.hasItem(name)) {
        const item: Item = {
          id: getters.nameToId(name),
          name: name.trim(),
          pricePerUnit: 0,
          categoryId: categoryIdUncategorized,
        };
        commit("addItem", item);
      }

      const listItem: ListItem = {
        itemId: getters.nameToId(name),
        notes: "",
        quantity: 1,
      };

      if (!getters.listHasItemId(getters.nameToId(name))) {
        commit("addItemToList", listItem);
      }
    },
  },
  getters: {
    loading(state: State): boolean {
      return state.loading;
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
        if (item === null) {
          return;
        }

        const category = getters.findCategoryById(item.categoryId);
        if (category == undefined) {
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
            }),
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

    autocompleteItems(state: State, getters): Array<string> {
      return state.items
        .filter((item: Item) => !getters.listHasItemId(item.id))
        .map((item: Item) => item.name);
    },
  },
});
