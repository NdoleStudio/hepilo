<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'primary'"
    >
      <v-app-bar-nav-icon
        v-if="isLoggedIn"
        @click="setNavDrawer(!navDrawerActive)"
      ></v-app-bar-nav-icon>
      <v-container>
        <v-row>
          <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
            <v-toolbar-title
              :class="{ 'page-title--drawer-open': navDrawerOpen }"
              class="pl-2 text-h4 page-title"
              >{{ title }}</v-toolbar-title
            >
          </v-col>
        </v-row>
      </v-container>
      <v-menu left bottom v-if="isLoggedIn">
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <v-avatar size="30" color="black">
              <img
                :src="user.photoURL"
                :alt="user.name"
                v-if="hasProfilePicture"
              />
              <v-icon v-else>{{ accountIcon }}</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="px-2" nav>
          <v-list-item-group>
            <v-list-item @click="refreshApp">
              <v-list-item-icon class="pl-2">
                <v-icon>{{ refreshIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16 py-1">
                  <span class="pr-16"> Refresh </span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon class="pl-2">
                <v-icon>{{ settingsIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16 py-1">
                  <span class="pr-16"> Settings </span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-icon class="pl-2">
                <v-icon>{{ logoutIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16">
                  <span class="pr-16"> Logout </span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
        color="deep-purple accent-4"
      ></v-progress-linear>
    </v-app-bar>

    <v-navigation-drawer app v-model="navDrawerActive" clipped>
      <v-list shaped>
        <v-list-item-group color="primary">
          <v-list-item
            link
            :to="item.route"
            exact
            :class="{
              'v-list-item--active':
                item.routeNames.indexOf($route.name) !== -1,
            }"
            v-for="item in menuItems"
            :key="item.name"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <p class="text--secondary subtitle-1 text-center mt-10">
        {{ version }}
      </p>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
      <v-snackbar
        text
        :color="notification.type"
        v-model="notificationActive"
        :timeout="notification.timeout"
      >
        <v-icon
          v-if="notification.type === 'success'"
          :color="notification.type"
          >{{ tickIcon }}</v-icon
        >
        {{ notification.message }}
        <template v-slot:action="{ attrs }">
          <v-btn
            :color="notification.type"
            text
            v-bind="attrs"
            @click="disableNotification"
          >
            <span class="font-weight-bold">Close</span>
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import {
  mdiAccount,
  mdiCheck,
  mdiCog,
  mdiFormatListCheckbox,
  mdiLogout,
  mdiRefresh,
} from "@mdi/js";
import { Location } from "vue-router";
import { getFirebaseAuth } from "@/plugins/firebase";
import splitbee from "@/plugins/splitbee";
import { User, Notification, NotificationRequest } from "@/store";
import { getPlatformName } from "@/plugins/utils";

interface MenuItem {
  name: string;
  icon: string;
  route: Location;
  adminOnly?: boolean;
  hasAccount?: boolean;
  isNotAnonymous?: boolean;
  routeNames?: Array<string>;
}

@Component
export default class App extends Vue {
  settingsIcon: string = mdiCog;
  logoutIcon: string = mdiLogout;
  accountIcon: string = mdiAccount;
  tickIcon: string = mdiCheck;
  refreshIcon: string = mdiRefresh;

  @Getter("loading") loading!: boolean;
  @Getter("title") title!: boolean;
  @Getter("user") user!: User;
  @Getter("navDrawerOpen") navDrawerOpen!: boolean;
  @Getter("notification") notification!: Notification;
  @Getter("isLoggedIn") isLoggedIn!: User;
  @Getter("hasProfilePicture") hasProfilePicture!: boolean;

  @Action("disableNotification") disableNotification!: () => void;
  @Action("setNavDrawer") setNavDrawer!: (isOpen: boolean) => void;
  @Action("addNotification") addNotification!: (
    request: NotificationRequest
  ) => void;

  get version(): string {
    return process.env.VUE_APP_COMMIT_HASH.slice(0, 7);
  }

  get navDrawerActive(): boolean {
    return this.navDrawerOpen;
  }

  set navDrawerActive(value: boolean) {
    this.setNavDrawer(value);
  }

  get notificationActive(): boolean {
    return this.notification.active;
  }

  set notificationActive(state: boolean) {
    this.disableNotification();
  }

  get menuItems(): Array<MenuItem> {
    return [
      {
        adminOnly: true,
        name: "Shopping List",
        icon: mdiFormatListCheckbox,
        route: {
          name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW,
        },
        routeNames: [this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW],
      },
    ];
  }

  mounted(): void {
    this.listenForDarkMode();
  }

  listenForDarkMode(): void {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      // Chrome & Firefox
      darkMediaQuery.addEventListener("change", (event) => {
        this.$vuetify.theme.dark = event.matches;
      });
    } catch (error) {
      try {
        // Safari
        darkMediaQuery.addListener(() => {
          this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  refreshApp(): void {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const promises = Array<Promise<boolean>>();
        registrations.forEach((registration) => {
          promises.push(registration.unregister());
        });
        return Promise.all(promises);
      })
      .then(() =>
        caches.keys().then((keys) => keys.map((key) => caches.delete(key)))
      )
      .then(() => {
        this.addNotification({
          type: "success",
          message: `Update successful! The ${getPlatformName()} will reload in a few seconds.`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(console.error);
  }

  logout(): void {
    getFirebaseAuth()
      .signOut()
      .then(() => {
        splitbee.reset();
        this.$router.push({ name: this.$constants.ROUTE_NAMES.HOME });
      });
  }
}
</script>

<style lang="scss">
.v-application {
  .w-full {
    width: 100%;
  }

  .page-title {
    transition: margin 100ms ease-out;
    &--drawer-open {
      margin-left: 160px;
    }
  }
}
</style>
