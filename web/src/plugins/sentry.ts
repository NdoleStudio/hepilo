// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Sentry from "@sentry/vue";
import Vue from "vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BrowserTracing } from "@sentry/tracing";
import router from "../router";
import { getFirebaseAuth } from "@/plugins/firebase";

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_DSN || undefined,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: [process.env.VUE_APP_SENTRY_TRACE_ORIGIN, /^\//],
    }),
  ],
  Vue: Vue,
  environment: process.env.VUE_APP_ENV,
  release:
    process.env.VUE_APP_SENTRY_PROJECT_NAME +
    "@" +
    process.env.VUE_APP_COMMIT_HASH,
  tracesSampleRate: 1.0,
});

export const captureSentryError = (error: Error) => {
  const user = getFirebaseAuth().currentUser;
  if (user) {
    Sentry.setUser({ id: user.uid });
  } else {
    Sentry.setUser(null);
  }
  console.error(error);
  Sentry.captureException(error);
};

export const captureSentryMessage = (message: string): void => {
  const user = getFirebaseAuth().currentUser;
  if (user) {
    Sentry.setUser({ id: user.uid });
  } else {
    Sentry.setUser(null);
  }
  Sentry.captureMessage(JSON.stringify(message));
};

export default Sentry;
