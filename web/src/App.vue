<template>
  <v-app
    :class="{
      'v-application--drawer--open': navDrawerActive,
    }"
  >
    <v-app-bar
      app
      :dark="$vuetify.theme.dark"
      clipped-left
      :color="$vuetify.theme.dark ? 'grey darken-4' : 'lime'"
    >
      <v-app-bar-nav-icon
        v-if="$route.meta.showNav"
        id="header-drawer-btn"
        @click="setNavDrawer(!navDrawerActive)"
      ></v-app-bar-nav-icon>
      <div
        class="d-flex align-center cursor-pointer"
        @click="goHome"
        v-if="!isLoggedIn && !loading && !$route.meta.showNav"
      >
        <v-img max-height="55" max-width="55" src="@/assets/logo.png"></v-img>
        <h4
          class="ml-2"
          :class="{
            'text-h4': $vuetify.breakpoint.mdAndUp,
            'text-h5': !$vuetify.breakpoint.mdAndUp,
          }"
        >
          {{ appData.name }}
        </h4>
      </div>
      <v-container>
        <v-row>
          <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
            <v-toolbar-title
              class="pl-2"
              :class="{
                'text-h4': $vuetify.breakpoint.mdAndUp,
                'text-h5': !$vuetify.breakpoint.mdAndUp,
              }"
            >
              <div
                class="page-title"
                :style="{ 'margin-left': titleLeftPadding + 'px' }"
              >
                {{ title }}
              </div>
            </v-toolbar-title>
          </v-col>
        </v-row>
      </v-container>
      <v-btn
        color="primary"
        v-if="
          !isLoggedIn &&
          $constants.ROUTE_NAMES.LOGIN !== $route.name &&
          !loading &&
          !$route.meta.showNav
        "
        :to="{ name: $constants.ROUTE_NAMES.LOGIN }"
      >
        Get Started
      </v-btn>
      <v-menu left bottom v-if="$route.meta.showNav">
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on" id="header-account-settings">
            <v-avatar size="36" color="black">
              <img
                :src="user.photoURL"
                :alt="user.name"
                v-if="hasProfilePicture"
              />
              <span class="white--text text-h5" v-else>A</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="px-2" nav :dense="$vuetify.breakpoint.mdAndDown">
          <v-list-item-group>
            <v-list-item @click="refreshApp">
              <v-list-item-icon class="pl-2">
                <v-icon dense>{{ refreshIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16 py-1">
                  <span :class="{ 'pr-16': $vuetify.breakpoint.mdAndUp }">
                    Refresh
                  </span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item :to="{ name: $constants.ROUTE_NAMES.SETTINGS_INDEX }">
              <v-list-item-icon class="pl-2">
                <v-icon dense>{{ settingsIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16 py-1">
                  <span :class="{ 'pr-16': $vuetify.breakpoint.mdAndUp }">
                    Settings
                  </span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-icon class="pl-2">
                <v-icon dense>{{ logoutIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n3">
                <v-list-item-title class="pr-16">
                  <span :class="{ 'pr-16': $vuetify.breakpoint.mdAndUp }">
                    <span v-if="isLoggedIn">Logout</span>
                    <span v-else>Exit Demo</span>
                  </span>
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
        color="lime"
      ></v-progress-linear>
    </v-app-bar>

    <v-navigation-drawer app v-model="navDrawerActive" clipped>
      <v-list shaped two-line>
        <v-list-item-group color="primary">
          <v-list-item
            link
            two-line
            :to="item.route"
            exact
            v-for="item in menuItems"
            :key="JSON.stringify(item.route)"
          >
            <v-list-item-avatar rounded>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.secondary }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-divider class="my-2"></v-divider>
      <div class="w-full text-center mt-4">
        <add-list-button></add-list-button>
      </div>
      <v-divider class="mt-4"></v-divider>
      <v-list shaped v-if="$route.meta.showNav">
        <v-list-item-group color="primary">
          <v-list-item
            link
            :to="item.route"
            exact
            v-for="item in manageMenuItems"
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
      <div class="d-flex justify-center mt-5">
        <a :href="githubLInk">
          <img
            alt="GitHub Repo stars"
            src="https://img.shields.io/github/stars/NdoleStudio/hepilo?style=social"
          />
        </a>
      </div>
      <div class="d-flex justify-center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <a
              class="text-decoration-none subtitle-2 text--secondary"
              :href="githubLInk"
              target="_blank"
              v-bind="attrs"
              v-on="on"
            >
              {{ version }}
            </a>
          </template>
          <span>version</span>
        </v-tooltip>
      </div>
    </v-navigation-drawer>
    <v-main :class="{ 'grey lighten-4': !$vuetify.theme.dark }">
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
        <v-icon
          v-if="notification.type === 'info'"
          :color="notification.type"
          >{{ infoIcon }}</v-icon
        >
        {{ notification.message }}
        <template v-slot:action="{ attrs }">
          <v-btn
            v-if="$vuetify.breakpoint.lgAndUp"
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
  mdiAccountCog,
  mdiArchiveCogOutline,
  mdiCheck,
  mdiInformation,
  mdiLogin,
  mdiLogout,
  mdiPlaylistEdit,
  mdiRefresh,
  mdiShapeOutline,
} from "@mdi/js";
import { Location } from "vue-router";
import { getFirebaseAuth } from "@/plugins/firebase";
import splitbee from "@/plugins/splitbee";
import {
  User,
  Notification,
  NotificationRequest,
  List,
  AppData,
} from "@/store";
import { getPlatformName } from "@/plugins/utils";
import AddListButton from "@/components/AddListButton.vue";

interface MenuItem {
  name: string;
  icon: string;
  secondary?: string;
  route: Location;
  adminOnly?: boolean;
  hasAccount?: boolean;
  isNotAnonymous?: boolean;
}

@Component({
  components: { AddListButton },
})
export default class App extends Vue {
  logoutIcon: string = mdiLogout;
  accountIcon: string = mdiAccount;
  tickIcon: string = mdiCheck;
  infoIcon: string = mdiInformation;
  refreshIcon: string = mdiRefresh;
  settingsIcon: string = mdiAccountCog;
  loginIcon: string = mdiLogin;

  @Getter("appData") appData!: AppData;
  @Getter("loading") loading!: boolean;
  @Getter("title") title!: string;
  @Getter("user") user!: User;
  @Getter("navDrawerOpen") navDrawerOpen!: boolean;
  @Getter("notification") notification!: Notification;
  @Getter("isLoggedIn") isLoggedIn!: boolean;
  @Getter("listIcon") listIcon!: (name: string) => string;
  @Getter("hasProfilePicture") hasProfilePicture!: boolean;
  @Getter("lists") lists!: Array<List>;
  @Action("disableNotification") disableNotification!: () => void;
  @Action("resetState") resetState!: () => void;
  @Action("setNavDrawer") setNavDrawer!: (isOpen: boolean) => void;
  @Action("addNotification") addNotification!: (
    request: NotificationRequest
  ) => void;

  get version(): string {
    return process.env.VUE_APP_COMMIT_HASH.slice(0, 7);
  }

  get githubLInk(): string {
    return process.env.VUE_APP_GITHUB_LINK;
  }

  get navDrawerActive(): boolean {
    return this.navDrawerOpen && this.$route.meta?.showNav === true;
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

  get titleLeftPadding(): number {
    if (this.$vuetify.breakpoint.mdAndDown || !this.navDrawerOpen) {
      return 0;
    }
    return 130;
  }

  get menuItems(): Array<MenuItem> {
    return this.lists.map((list) => {
      return {
        name: list.name,
        secondary: `${list.items.length} item${
          list.items.length === 1 ? "" : "s"
        }`,
        icon: this.listIcon(list.icon),
        route: {
          name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW,
          params: { listId: list.id },
        },
      };
    });
  }

  get manageMenuItems(): Array<MenuItem> {
    return [
      {
        name: "Manage Lists",
        icon: mdiPlaylistEdit,
        route: {
          name: this.$constants.ROUTE_NAMES.MANAGE_LISTS,
        },
      },
      {
        name: "Manage Categories",
        icon: mdiShapeOutline,
        route: {
          name: this.$constants.ROUTE_NAMES.MANAGE_CATEGORIES,
        },
      },
      {
        name: "Manage Items",
        icon: mdiArchiveCogOutline,
        route: {
          name: this.$constants.ROUTE_NAMES.MANAGE_ITEMS,
        },
      },
    ];
  }

  mounted(): void {
    this.setThemeColor();
    this.listenForDarkMode();
  }

  listenForDarkMode(): void {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      // Chrome & Firefox
      darkMediaQuery.addEventListener("change", (event) => {
        this.$vuetify.theme.dark = event.matches;
        this.setThemeColor();
      });
    } catch (error) {
      try {
        // Safari
        darkMediaQuery.addListener(() => {
          this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
          this.setThemeColor();
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  setThemeColor(): void {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", this.themeColor);
  }

  get themeColor(): string {
    if (this.$vuetify.theme.dark) {
      return "#000000";
    }
    return "#AFB42B";
  }

  goHome(): void {
    this.$router.push({
      name: this.$constants.ROUTE_NAMES.HOME,
    });
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
          message: `This ${getPlatformName()} will reload in a few seconds.`,
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
        this.resetState();
        splitbee.reset();
        this.addNotification({
          type: "info",
          message: "You have successfully logged out",
        });
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
  }

  a.text--secondary {
    &:hover {
      color: #2196f3 !important;
    }
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .v-select-list {
    padding-bottom: 0;
    padding-top: 0;
  }

  &--drawer--open {
    @media screen and (min-width: 1264px) {
      .v-snack__wrapper,
      .v-dialog--active {
        margin-left: 270px;
      }
    }

    @media screen and (max-width: 1930px) and (min-width: 1263px) {
      .page-title {
        padding-left: 30px;
      }
    }
  }

  .v-expansion-panel-content.px-0 {
    .v-expansion-panel-content__wrap {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
html {
  overflow-y: auto;
}
</style>
