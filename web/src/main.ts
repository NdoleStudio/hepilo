import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { Constants } from "@/plugins/constants";
import "@/plugins/firebase";
import "@/plugins/sentry";
import "driver.js/dist/driver.min.css";
import { date } from "@/filters/date";

Vue.config.productionTip = false;

Vue.use(Constants);

Vue.filter("date", date);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
