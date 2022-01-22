<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-btn
        color="primary"
        large
        class="px-10"
        :to="{ name: $constants.ROUTE_NAMES.LOGIN }"
      >
        <v-icon class="pr-2">{{ loginIcon }}</v-icon>
        Login
      </v-btn>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import "firebaseui/dist/firebaseui.css";
import { mdiLogin } from "@mdi/js";

@Component
export default class Home extends Vue {
  loginIcon: string = mdiLogin;
}
</script>
