import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface State {
  loading: boolean;
  title: string;
}

export default new Vuex.Store({
  state: {
    loading: false,
    title: "",
  },
  mutations: {
    setLoading(state: State, loading: boolean) {
      state.loading = loading;
    },

    setTitle(state: State, title: string) {
      state.title = title;
    },
  },
  actions: {
    setLoading({ commit }, loading: boolean) {
      commit("setLoading", loading);
    },

    setTitle({ commit }, title: string) {
      commit("setTitle", title);
    },
  },
  getters: {
    loading(state: State): boolean {
      return state.loading;
    },

    title(state: State): string {
      return state.title;
    },
  },
});
