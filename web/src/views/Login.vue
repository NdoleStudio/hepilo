<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="4" xl="3" class="mt-n16">
        <h3 class="text-h2 text-center mb-4">Login</h3>
        <v-card max-width="360" class="mx-auto">
          <v-card-text class="px-0">
            <div id="firebaseui-auth-container" ref="authContainer"></div>
            <v-progress-circular
              v-if="!firebaseUIInitialized"
              class="mx-auto d-block my-16"
              :size="80"
              :width="5"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </v-card-text>
        </v-card>
        <div class="text-center mt-4">
          <back-button></back-button>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import firebase from "@/plugins/firebase";
import { getAuth, ProviderId } from "firebase/auth";
import { Action, Getter } from "vuex-class";
import { AppData } from "@/store";
import BackButton from "@/components/BackButton.vue";
@Component({
  components: { BackButton },
})
export default class Login extends Vue {
  ui: firebaseui.auth.AuthUI | null = null;
  firebaseUIInitialized = false;

  @Action("setTitle") setTitle!: (title: string) => void;
  @Getter("appData") appData!: AppData;

  beforeDestroy(): void {
    if (this.ui) {
      this.ui.delete();
    }
  }

  mounted(): void {
    this.ui = new firebaseui.auth.AuthUI(getAuth(firebase));
    this.ui.start("#firebaseui-auth-container", this.uiConfig());
    this.setTitle("");
  }

  uiConfig(): firebaseui.auth.Config {
    return {
      callbacks: {
        signInSuccessWithAuthResult: () => {
          this.$root.$emit(
            this.$constants.NOTIFICATION.EVENTS.SUCCESS,
            "Login successfull!"
          );
          this.$router.push({
            name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_INDEX,
          });
          return false;
        },
        uiShown: () => {
          // The widget is rendered.
          // Hide the loader.
          this.firebaseUIInitialized = true;
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
      signInSuccessUrl: this.appData.url,
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        ProviderId.GOOGLE,
        ProviderId.PASSWORD,
      ],
      // Terms of service url.
      tosUrl: this.appData.url + "/terms-and-conditions",
      // Privacy policy url.
      privacyPolicyUrl: this.appData.url + "/privacy-policy",
    };
  }
}
</script>
