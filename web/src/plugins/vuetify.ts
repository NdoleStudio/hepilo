import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: false,
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
