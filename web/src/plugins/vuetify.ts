import Vue from "vue";
import Vuetify from "vuetify/lib";
import { isDarkModeOn } from "@/plugins/utils";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: isDarkModeOn(),
    themes: {
      light: {
        primary: "#C6FF00",
      },
    },
  },
  icons: {
    iconfont: "mdiSvg",
  },
});
