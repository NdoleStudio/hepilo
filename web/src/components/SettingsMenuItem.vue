<template>
  <v-dialog v-model="dialog" :width="dialogWidth" max-width="90%">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item v-bind="attrs" v-on="on">
        <v-list-item-icon class="pl-2">
          <v-icon dense>{{ settingsIcon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content class="ml-n3">
          <v-list-item-title class="pr-16 py-1">
            <span class="pr-16"> Settings </span>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title>
        Account Settings
        <v-spacer></v-spacer>
        <v-btn color="info" icon @click="closePopup">
          <v-icon>{{ closeIcon }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form v-model="formValid" lazy-validation>
          <v-select
            class="mt-2"
            :disabled="saving"
            :items="currencies"
            v-model="formCurrency"
            outlined
            label="Currency"
          >
          </v-select>
        </v-form>
      </v-card-text>
      <v-card-actions class="mt-n8">
        <v-btn
          text
          color="success"
          :disabled="!formValid || saving"
          @click="onSave"
          >Save</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="info" text @click="closePopup">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { dialogWidth } from "@/plugins/vuetify";
import { mdiAccountCog, mdiClose } from "@mdi/js";
import { DEFAULT_CURRENCY } from "@/plugins/intl";
import { Action, Getter } from "vuex-class";
import { SelectItem } from "@/store";

@Component
export default class SettingsMenuItem extends Vue {
  dialog = false;
  closeIcon: string = mdiClose;
  formValid = false;
  formCurrency = DEFAULT_CURRENCY;
  settingsIcon: string = mdiAccountCog;

  @Getter("currency") currency!: string;
  @Getter("saving") saving!: boolean;
  @Getter("currencySelectItems") currencies!: Array<SelectItem>;
  @Action("setCurrency") setCurrency!: (currency: string) => void;

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  mounted(): void {
    this.formCurrency = this.currency;
  }

  closePopup(): void {
    this.clearForm();
    this.dialog = false;
  }

  showPopup(): void {
    this.dialog = true;
  }

  clearForm(): void {
    this.formCurrency = this.currency;
  }

  async onSave(): Promise<void> {
    await this.setCurrency(this.formCurrency);
    this.dialog = false;
    this.clearForm();
  }
}
</script>
