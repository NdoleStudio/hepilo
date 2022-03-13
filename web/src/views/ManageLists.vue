<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <shopping-list-demo-banner></shopping-list-demo-banner>
        <div
          class="d-flex"
          :class="{
            'justify-center':
              lists.length === 0 && $vuetify.breakpoint.mdAndDown,
          }"
        >
          <v-spacer v-if="lists.length"></v-spacer>
          <v-dialog v-model="dialog" :max-width="dialogWidth">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" v-bind="attrs" v-on="on" class="mb-4">
                <v-icon>{{ addIcon }}</v-icon>
                Add List
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                {{ formTitle }}
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
                    v-model="editedList.name"
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
                    v-model="editedList.icon"
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
        </div>
        <v-card tile>
          <v-card-text class="px-0 py-0">
            <v-list subheader two-line class="pb-0 px-0" nav>
              <template v-for="(list, index) in lists">
                <v-list-item
                  :key="list.id"
                  @click="onEditList(list)"
                  class="mb-0"
                >
                  <v-list-item-avatar rounded>
                    <v-icon>{{ listIcon(list.icon) }}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-text="list.name"></v-list-item-title>
                    <v-list-item-subtitle
                      >{{ list.items.length }} items</v-list-item-subtitle
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="d-flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click="onEditList(list)"
                            color="info"
                            class="mr-2"
                            v-bind="attrs"
                            v-on="on"
                            icon
                          >
                            <v-icon>{{ editIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit {{ list.name }}</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click.stop="onDeleteList(list)"
                            color="error"
                            icon
                            v-bind="attrs"
                            v-on="on"
                            class="ml-2"
                            :disabled="deleteDisabled"
                          >
                            <v-icon>{{ deleteIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Delete {{ list.name }}</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>
                <v-divider
                  class="mt-0"
                  v-if="index < lists.length - 1"
                  :key="index"
                ></v-divider>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
        <v-dialog v-model="dialogDelete" :max-width="dialogWidth" width="400">
          <v-card>
            <v-card-title class="text-h5">
              <div class="text-break">
                Are you sure you want to delete
                <code class="d-inline-block">{{ this.editedList.name }}</code>
                ?
              </div>
            </v-card-title>
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
import { Component, Vue } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import {
  List,
  LIST_ICON_DEFAULT,
  SelectItem,
  UpsertListRequest,
} from "@/store";
import { dialogWidth } from "@/plugins/vuetify";
import shortUUID from "short-uuid";
import { mdiClose, mdiPlus, mdiSquareEditOutline, mdiTrashCan } from "@mdi/js";
import ShoppingListDemoBanner from "@/components/ShoppingListDemoBanner.vue";
@Component({
  components: { ShoppingListDemoBanner },
})
export default class ManageLists extends Vue {
  formNameRules = [
    (value: string | null): boolean | string =>
      (!!value && value.trim() != "") || "Name is required",
    (value: string | null): boolean | string =>
      (value && value.length <= 15) || "Name must be less than 15 characters",
  ];
  formValid = false;
  addIcon: string = mdiPlus;
  editIcon: string = mdiSquareEditOutline;
  deleteIcon: string = mdiTrashCan;
  closeIcon: string = mdiClose;
  dialog = false;
  dialogDelete = false;
  editedList: UpsertListRequest = {
    name: "",
    id: "",
    icon: LIST_ICON_DEFAULT,
  };

  defaultList: UpsertListRequest = {
    name: "",
    id: "",
    icon: LIST_ICON_DEFAULT,
  };

  @Getter("lists") lists!: Array<List>;
  @Getter("saving") saving!: boolean;
  @Getter("listIcon") listIcon!: (name: string) => string;
  @Getter("listIconSelectItems") listIcons!: Array<SelectItem>;

  @Action("upsertList") upsertList!: (
    request: UpsertListRequest
  ) => Promise<void>;
  @Action("deleteList") deleteList!: (listId: string) => Promise<void>;
  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("loadState") loadState!: () => Promise<void>;

  get prependIcon(): string {
    return this.listIcon(this.editedList.icon);
  }

  get deleteDisabled(): boolean {
    return this.lists.length < 2;
  }

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  get formTitle(): string {
    return this.editedList.id === this.defaultList.id
      ? "Create List"
      : "Edit List";
  }

  mounted(): void {
    this.loadState();
    this.setTitle("Manage Lists");
  }

  closePopup(): void {
    this.clearForm();
    this.dialog = false;
  }

  closeDeleteDialog(): void {
    this.dialogDelete = false;
    this.$nextTick(() => {
      this.clearForm();
    });
  }

  async onSave(): Promise<void> {
    await this.upsertList({
      name: this.editedList.name,
      icon: this.editedList.icon,
      id: this.editedList.id || shortUUID.generate(),
    });
    this.dialog = false;
    this.clearForm();
  }

  onDeleteList(list: List): void {
    this.editedList = { ...list };
    this.dialogDelete = true;
  }

  onDeleteListConfirm(): void {
    this.deleteList(this.editedList.id);
    this.closeDeleteDialog();
  }

  onEditList(list: List): void {
    this.editedList = { ...list };
    this.dialog = true;
  }

  clearForm(): void {
    this.editedList = {
      ...this.defaultList,
    };
  }
}
</script>
