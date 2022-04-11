import splitbee from "@splitbee/web";
import { captureSentryError } from "@/plugins/sentry";
import { getFirebaseAuth } from "@/plugins/firebase";

splitbee.init({
  disableCookie: true,
  token: process.env.VUE_APP_SPLITBEE_TOKEN,
});

// eslint-disable-next-line
export const addAnalyticsEvent = (
  name: string,
  params?: Record<string, string | number | undefined>
) => {
  params = {
    ...params,
    version: process.env.VUE_APP_COMMIT_HASH,
    userId: getFirebaseAuth().currentUser?.uid,
  };
  splitbee.track(name, params).catch(captureSentryError);
};

export default splitbee;
