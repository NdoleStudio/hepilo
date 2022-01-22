import { ROUTE_NAMES } from "@/router";
import _Vue from "Vue";

export const CONSTANTS = {
  ROUTE_NAMES,
  NOTIFICATION: {
    EVENTS: {
      ERROR: "notification.events.error",
      SUCCESS: "notification.events.success",
      INFO: "notification.events.info",
    },
  },
  APP: {
    NAME: process.env.VUE_APP_APP_NAME,
    SUPPORT_EMAIL: process.env.VUE_APP_APP_SUPPORT_EMAIL,
  },
};

export function Constants(Vue: typeof _Vue): void {
  Vue.prototype.$constants = CONSTANTS;
}
