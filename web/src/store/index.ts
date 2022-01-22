import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

interface State {
  loading: boolean;
}

export default new Vuex.Store({
  state: {
    loading: false,
  },
  mutations: {
    setLoading(state: State, loading: boolean) {
      state.loading = loading;
    },
  },
  actions: {
    setLoading({ commit }, loading: boolean) {
      commit("setLoading", loading);
    },
  },
  getters: {
    loading(state: State): boolean {
      return state.loading;
    },
  },
});
