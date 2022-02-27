<template>
  <v-dialog
    v-model="dialog"
    max-width="90%"
    :width="dialogWidth"
    transition="scale-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" v-bind="attrs" v-on="on" class="mx-auto">
        <v-icon>{{ addIcon }}</v-icon>
        Create New List
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        Create New List
        <v-spacer></v-spacer>
        <v-btn color="info" icon @click="closePopup">
          <v-icon>{{ closeIcon }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form v-model="formValid" lazy-validation>
          <v-text-field
            class="mt-2"
            aria-required="true"
            :disabled="saving"
            v-model="formName"
            :rules="formNameRules"
            label="Name"
            counter="15"
            persistent-placeholder
            placeholder="e.g Shopping List"
            outlined
          ></v-text-field>
          <v-select
            class="mt-2"
            :disabled="saving"
            :items="listIcons"
            v-model="formIcon"
            :append-icon="prependIcon"
            outlined
            label="Icon"
          ></v-select>
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
import { Action, Getter } from "vuex-class";
import {
  List,
  LIST_ICON_DEFAULT,
  SelectItem,
  UpsertListRequest,
} from "@/store";
import { dialogWidth } from "@/plugins/vuetify";
import { mdiClose, mdiPlus } from "@mdi/js";
import shortUUID from "short-uuid";

@Component
export default class AddListButton extends Vue {
  formNameRules = [
    (value: string | null): boolean | string =>
      (!!value && value.trim() != "") || "Name is required",
    (value: string | null): boolean | string =>
      (value && value.length <= 15) || "Name must be less than 15 characters",
  ];
  formName = "";
  formIcon = LIST_ICON_DEFAULT;
  dialog = false;
  formValid = false;
  addIcon: string = mdiPlus;
  closeIcon: string = mdiClose;

  @Getter("saving") saving!: boolean;
  @Getter("listIconSelectItems") listIcons!: Array<SelectItem>;
  @Getter("listIcon") listIcon!: (name: string) => string;
  @Getter("lists") lists!: Array<List>;
  @Action("upsertList") upsertList!: (
    request: UpsertListRequest
  ) => Promise<void>;

  closePopup(): void {
    this.clearForm();
    this.dialog = false;
  }

  clearForm(): void {
    this.formName = "";
    this.formIcon = LIST_ICON_DEFAULT;
  }

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  get prependIcon(): string {
    return this.listIcon(this.formIcon);
  }

  async onSave(): Promise<void> {
    await this.upsertList({
      name: this.formName,
      icon: this.formIcon,
      id: shortUUID.generate(),
    });
    this.dialog = false;
    this.clearForm();

    await this.$router.push({
      name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW,
      params: {
        listId: this.lists[this.lists.length - 1].id,
      },
    });
  }
}
</script>

<style scoped></style>
