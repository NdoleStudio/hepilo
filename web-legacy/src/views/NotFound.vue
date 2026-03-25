<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="px-5" offset-md="3" offset-lg="3" md="6" lg="6">
        <v-card>
          <v-card-title class="just">
            <div class="mx-auto text-center text-break">
              404: Sorry we can't find the page you're looking for
            </div>
          </v-card-title>
          <v-card-text>
            <v-img
              contain
              class="mx-auto"
              max-width="500"
              max-height="500"
              src="@/assets/not-found.svg"
            ></v-img>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="lime darken-4"
              large
              exact
              :block="$vuetify.breakpoint.mdAndDown"
              :to="{ name: $constants.ROUTE_NAMES.HOME }"
              class="font-weight-bold mx-auto mb-4"
              >Take Me Home</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { captureSentryError } from "@/plugins/sentry";
import { Action } from "vuex-class";
import { NotificationRequest } from "@/types/state";
@Component
export default class NotFound extends Vue {
  @Action("addNotification") addNotification!: (
    request: NotificationRequest
  ) => void;
  mounted(): void {
    captureSentryError(new Error("URL not found:" + window.location.href));
    this.addNotification({
      type: "info",
      message: `The requested URL: ${window.location.href} was not found.`,
    });
  }
}
</script>
