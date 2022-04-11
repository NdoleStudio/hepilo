<template>
  <v-snackbar
    v-model="snackbarShow"
    text
    :timeout="-1"
    class="snack-alert mb-10"
    bottom
    multi-line
  >
    <div class="snack-alert__close-btn mt-n2 mr-n2">
      <v-btn x-small exact fab @click="onClose">
        <v-icon dark>{{ closeIcon }}</v-icon>
      </v-btn>
    </div>
    <slot></slot>
    <template v-slot:action="{ attrs }">
      <v-btn
        @click="onActionClick"
        color="primary"
        small
        v-bind="attrs"
        :href="href"
      >
        Get
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { mdiAlertCircle, mdiClose } from "@mdi/js";
import { addAnalyticsEvent } from "@/plugins/splitbee";

@Component
export default class SnackAlert extends Vue {
  @Prop({ required: true, type: String }) href!: string;
  warningIcon: string = mdiAlertCircle;
  snackbarShow = true;
  closeIcon: string = mdiClose;

  onClose(): void {
    addAnalyticsEvent("snack_alert_closed");
    this.snackbarShow = false;
  }

  onActionClick(): void {
    addAnalyticsEvent("snack_alert_action_clicked");
  }
}
</script>
