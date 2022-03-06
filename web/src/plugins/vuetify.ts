import Vue from "vue";
import Vuetify from "vuetify/lib";
import { isDarkModeOn } from "@/plugins/utils";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
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

export const dialogWidth = (breakpointName: string): string => {
  switch (breakpointName) {
    case "md":
      return "500";
    case "lg":
      return "600";
    case "xl":
      return "780";
    default:
      return "90%";
  }
};
