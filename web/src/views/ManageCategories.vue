<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <div
          class="d-flex"
          :class="{
            'justify-center':
              categories.length === 0 && $vuetify.breakpoint.mdAndDown,
          }"
        >
          <v-spacer v-if="categories.length"></v-spacer>
          <v-dialog v-model="dialog" :max-width="dialogWidth">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" v-bind="attrs" v-on="on" class="mb-4">
                <v-icon>{{ addIcon }}</v-icon>
                Add Category
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
                    v-model="editedCategory.name"
                    :rules="formNameRules"
                    label="Name"
                    counter="15"
                    persistent-placeholder
                    placeholder="e.g Meat"
                    outlined
                  ></v-text-field>
                  <v-select
                    class="mt-2"
                    :disabled="saving"
                    :items="categoryColors"
                    v-model="editedCategory.color"
                    outlined
                    label="Color"
                  >
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item v-on="on" v-bind="attrs">
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                        <v-list-item-action>
                          <v-icon :color="item.value">
                            {{ squareIcon }}
                          </v-icon>
                        </v-list-item-action>
                      </v-list-item>
                    </template>
                    <template v-slot:append>
                      <v-icon :color="editedCategory.color">
                        {{ squareIcon }}
                      </v-icon>
                    </template>
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
        </div>
        <v-card tile>
          <v-card-text class="px-0 py-0">
            <v-list subheader two-line class="pb-0 px-0" nav>
              <template v-for="(category, index) in categories">
                <v-list-item
                  :key="category.id"
                  @click="onEditCategory(category)"
                  class="mb-0"
                >
                  <v-list-item-avatar rounded>
                    <v-icon :color="category.color">{{ squareIcon }}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      class="text-overline"
                      v-text="category.name"
                    ></v-list-item-title>
                    <v-list-item-subtitle>
                      {{ categoryItemsCount(category.id) }}
                      items
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="d-flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click="onEditCategory(category)"
                            color="info"
                            class="mr-2"
                            v-bind="attrs"
                            v-on="on"
                            icon
                          >
                            <v-icon>{{ editIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit {{ category.name }}</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click.stop="onDeleteList(category)"
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
                        <span>Delete {{ category.name }}</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>
                <v-divider
                  class="mt-0"
                  v-if="index < categories.length - 1"
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
                <code class="d-inline-block">{{
                  this.editedCategory.name
                }}</code>
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
  Category,
  CATEGORY_COLOR_TEAL,
  Item,
  List,
  SelectItem,
  UpsertCategoryRequest,
  UpsertListRequest,
} from "@/store";
import { dialogWidth } from "@/plugins/vuetify";
import {
  mdiClose,
  mdiPlus,
  mdiSquare,
  mdiSquareEditOutline,
  mdiTrashCan,
} from "@mdi/js";

@Component
export default class ManageCategories extends Vue {
  formNameRules = [
    (value: string | null): boolean | string =>
      (!!value && value.trim() != "") || "Category name is required",
    (value: string | null): boolean | string =>
      (value && value.length <= 15) ||
      "Category name must be less than 15 characters",
  ];
  squareIcon: string = mdiSquare;
  formValid = false;
  addIcon: string = mdiPlus;
  editIcon: string = mdiSquareEditOutline;
  deleteIcon: string = mdiTrashCan;
  closeIcon: string = mdiClose;
  dialog = false;
  dialogDelete = false;
  editedCategory: UpsertCategoryRequest = {
    name: "",
    id: "",
    color: CATEGORY_COLOR_TEAL,
  };

  defaultList: UpsertCategoryRequest = {
    name: "",
    id: "",
    color: CATEGORY_COLOR_TEAL,
  };

  @Getter("categoryColorSelectItems") categoryColors!: Array<SelectItem>;
  @Getter("lists") lists!: Array<List>;
  @Getter("items") items!: Array<Item>;
  @Getter("editableCategories") categories!: Array<Category>;
  @Getter("saving") saving!: boolean;
  @Getter("categoryItemsCount") categoryItemsCount!: (
    categoryId: string
  ) => string;

  @Action("upsertCategory") upsertCategory!: (
    request: UpsertCategoryRequest
  ) => Promise<void>;
  @Action("deleteCategory") deleteCategory!: (
    categoryId: string
  ) => Promise<void>;
  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("loadState") loadState!: () => Promise<void>;

  get deleteDisabled(): boolean {
    return this.lists.length < 2;
  }

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  get formTitle(): string {
    return this.editedCategory.id === this.defaultList.id
      ? "Add Category"
      : "Edit Category";
  }

  mounted(): void {
    this.loadState();
    this.setTitle("Manage Categories");
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
    await this.upsertCategory({
      name: this.editedCategory.name,
      id: this.editedCategory.id,
      color: this.editedCategory.color,
    });
    this.dialog = false;
    this.clearForm();
  }

  onDeleteList(category: Category): void {
    this.editedCategory = { ...category };
    this.dialogDelete = true;
  }

  onDeleteListConfirm(): void {
    this.deleteCategory(this.editedCategory.id);
    this.closeDeleteDialog();
  }

  onEditCategory(category: Category): void {
    this.editedCategory = { ...category };
    this.dialog = true;
  }

  clearForm(): void {
    this.editedCategory = {
      ...this.defaultList,
    };
  }
}
</script>
