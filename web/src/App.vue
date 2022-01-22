<template>
  <v-app>
    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ $constants.APP.NAME }}</v-toolbar-title>
      <v-spacer></v-spacer>
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
            <v-list-item>
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
import {
  mdiDotsVertical,
  mdiFormatListCheckbox,
  mdiLogout,
  mdiSync,
} from "@mdi/js";
import { Location } from "vue-router";

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

  get menuItems(): Array<MenuItem> {
    return [
      {
        adminOnly: true,
        name: "Shopping List",
        icon: mdiFormatListCheckbox,
        route: {
          name: this.$constants.ROUTE_NAMES.SHOPPING_LIST.INDEX,
        },
        routeNames: [this.$constants.ROUTE_NAMES.SHOPPING_LIST.INDEX],
      },
    ];
  }
}
</script>
