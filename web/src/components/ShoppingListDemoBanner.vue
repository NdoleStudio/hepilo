<template>
  <v-alert
    v-if="!isLoggedIn"
    :prominent="$vuetify.breakpoint.mdAndUp"
    :type="$vuetify.breakpoint.mdAndUp ? 'info' : undefined"
    text
    color="info"
  >
    <v-row align="center">
      <v-col class="grow">
        Your changes will not be saved when you leave this
        {{ platformName }} unless you
        <router-link
          v-if="!$vuetify.breakpoint.mdAndUp"
          :to="{ name: $constants.ROUTE_NAMES.LOGIN }"
          >login.</router-link
        >
        <span v-else>login.</span>
      </v-col>
      <v-col class="shrink" v-if="$vuetify.breakpoint.mdAndUp">
        <v-btn :to="{ name: $constants.ROUTE_NAMES.LOGIN }">
          <v-icon small class="mr-2">{{ loginIcon }}</v-icon>
          Login
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { getPlatformName } from "@/plugins/utils";
import { mdiLogin } from "@mdi/js";
import { Getter } from "vuex-class";
@Component
export default class ShoppingListDemoBanner extends Vue {
  @Getter("isLoggedIn") isLoggedIn!: boolean;
  loginIcon: string = mdiLogin;
  get platformName(): string {
    return getPlatformName();
  }
}
</script>
