import splitbee from "@splitbee/web";

splitbee.init({
  disableCookie: true,
  token: process.env.VUE_APP_SPLITBEE_TOKEN,
});

export default splitbee;
