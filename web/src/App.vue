<template>
  <v-app>
    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-container>
        <v-row>
          <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
            <v-toolbar-title>{{ title }}</v-toolbar-title>
          </v-col>
        </v-row>
      </v-container>
      <v-btn icon>
        <v-icon>{{ refreshIcon }}</v-icon>
      </v-btn>
      <v-menu left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>{{ menuIcon }}</v-icon>
          </v-btn>
        </template>
        <v-list class="px-2" nav>
          <v-list-item-group>
            <v-list-item @click="logout">
              <v-list-item-icon>
                <v-icon>{{ logoutIcon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n5">
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

    <v-navigation-drawer app v-model="drawer" clipped>
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
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Getter } from "vuex-class";
import {
  mdiDotsVertical,
  mdiFormatListCheckbox,
  mdiLogout,
  mdiSync,
} from "@mdi/js";
import { Location } from "vue-router";
import { getFirebaseAuth } from "@/plugins/firebase";
import splitbee from "@/plugins/splitbee";

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
  drawer = false;
  refreshIcon: string = mdiSync;
  menuIcon: string = mdiDotsVertical;
  logoutIcon: string = mdiLogout;
  @Getter("loading") loading!: boolean;
  @Getter("title") title!: boolean;
  get menuItems(): Array<MenuItem> {
    return [
      {
        adminOnly: true,
        name: "Shopping List",
        icon: mdiFormatListCheckbox,
        route: {
          name: this.$constants.ROUTE_NAMES.SHOPPING_LIST,
        },
        routeNames: [this.$constants.ROUTE_NAMES.SHOPPING_LIST],
      },
    ];
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
