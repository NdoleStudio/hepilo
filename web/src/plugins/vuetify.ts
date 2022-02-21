import Vue from "vue";
import Vuetify from "vuetify/lib";
import { isDarkModeOn } from "@/plugins/utils";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: isDarkModeOn(),
  },
  icons: {
    iconfont: "mdiSvg",
  },
});
