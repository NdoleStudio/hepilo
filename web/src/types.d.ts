import { CONSTANTS } from "@/plugins/constants";
import Vuetify from "@/plugins/vuetify";

declare module "vue/types/vue" {
  interface Vue {
    $constants: typeof CONSTANTS;
    $vuetify: typeof Vuetify;
  }
}
