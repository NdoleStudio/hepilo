<template>
  <v-container> </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import firebase from "@/plugins/firebase";

@Component
export default class Login extends Vue {
  ui: firebaseui.auth.AuthUI | null = null;

  beforeDestroy() {
    if (this.ui) {
      this.ui.delete();
    }
  }

  mounted() {
    try {
      this.ui = new firebaseui.auth.AuthUI(firebase.auth());
      this.ui.start("#firebaseui-auth-container", this.uiConfig());
    } catch (e) {
      sentry.captureMessage(e.message, Severity.Error);
    }
  }
  uiConfig(): firebaseui.auth.Config {
    return {
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          addAnalyticsEvent("login", {
            method: authResult.user.sign_in_provider,
          });
          this.setUser(authResult.user);
          this.$root.$emit(
            this.$constants.NOTIFICATION_EVENTS.SUCCESS,
            "Login successfull!"
          );
          if (this.afterAuthPath) {
            this.$router.push({ path: this.afterAuthPath });
            return false;
          }
          this.$router.push({
            name: this.$constants.ROUTE_NAMES.HOME,
          });
          return false;
        },
        uiShown: () => {
          // The widget is rendered.
          // Hide the loader.
          const element = document.getElementById("loader") as HTMLElement;
          element.remove();
          const container = this.$refs["authContainer"] as HTMLElement;
          Array.from(
            container.getElementsByClassName("firebaseui-idp-text-long")
          ).forEach((item: Element) => {
            item.textContent =
              item.textContent?.replace("Sign in with", "Continue with") ||
              null;
          });
        },
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: "popup",
      signInSuccessUrl: "https://nyangapay.com/user/profile",
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      // Terms of service url.
      tosUrl: "https://nyangapay.com/privacy-policy",
      // Privacy policy url.
      privacyPolicyUrl: "https://nyangapay.com/terms-and-conditions",
    };
  }
}
</script>
