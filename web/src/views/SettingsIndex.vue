<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>Account Settings</v-card-title>
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
            <v-btn color="error" text @click="onDeleteAccount"
              >Delete Account</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-dialog v-model="dialogDelete" :max-width="dialogWidth" width="400">
          <v-card>
            <v-card-title class="text-h5">
              Are you sure you want to delete your account?
            </v-card-title>
            <v-card-text>
              This action is permanent and irreversible!
            </v-card-text>
            <v-card-actions>
              <v-btn color="info" text @click="closeDeleteDialog">No</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="onDeleteListConfirm">Yes</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { dialogWidth } from "@/plugins/vuetify";
import { mdiClose } from "@mdi/js";
import { DEFAULT_CURRENCY } from "@/plugins/intl";
import { Action, Getter } from "vuex-class";
import { SelectItem } from "@/store";
import { getFirebaseAuth } from "@/plugins/firebase";
import splitbee from "@/plugins/splitbee";

@Component
export default class SettingsIndex extends Vue {
  closeIcon: string = mdiClose;
  dialogDelete = false;
  formValid = false;
  formCurrency = DEFAULT_CURRENCY;

  @Getter("currency") currency!: string;
  @Getter("saving") saving!: boolean;
  @Getter("currencySelectItems") currencies!: Array<SelectItem>;
  @Action("setCurrency") setCurrency!: (currency: string) => void;
  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("deleteAccount") deleteAccount!: (userId: string) => Promise<void>;

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  mounted(): void {
    this.setTitle("Settings");
    this.formCurrency = this.currency;
  }

  closeDeleteDialog(): void {
    this.dialogDelete = false;
    this.$nextTick(() => {
      this.clearForm();
    });
  }

  clearForm(): void {
    this.formCurrency = this.currency;
  }

  onDeleteAccount(): void {
    this.dialogDelete = true;
  }

  async onDeleteListConfirm(): Promise<void> {
    await this.deleteAccount(getFirebaseAuth().currentUser?.uid as string);
    splitbee.reset();
    await getFirebaseAuth().currentUser?.delete();
    this.closeDeleteDialog();
    await this.$router.push({ name: this.$constants.ROUTE_NAMES.HOME });
  }

  async onSave(): Promise<void> {
    await this.setCurrency(this.formCurrency);
    this.clearForm();
  }
}
</script>
