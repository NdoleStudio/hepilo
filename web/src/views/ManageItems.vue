<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <div
          class="d-flex"
          :class="{
            'justify-center':
              items.length === 0 && $vuetify.breakpoint.mdAndDown,
          }"
        >
          <v-text-field
            :prepend-inner-icon="searchIcon"
            solo-inverted
            placeholder="Search items"
            dense
            v-model="formQuery"
            class="mb-n2 mr-5"
          ></v-text-field>
          <v-spacer v-if="items.length"></v-spacer>
          <v-dialog v-model="dialog" :max-width="dialogWidth">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" v-bind="attrs" v-on="on" class="mb-4">
                <v-icon v-if="$vuetify.breakpoint.mdAndUp">
                  {{ addIcon }}
                </v-icon>
                Add Item
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
                    v-model="editedItem.name"
                    :rules="formNameRules"
                    label="Name"
                    counter="15"
                    persistent-placeholder
                    placeholder="e.g Meat"
                    outlined
                  ></v-text-field>
                  <v-text-field
                    class="mt-2"
                    :disabled="saving"
                    aria-required="true"
                    v-model="editedItem.pricePerUnit"
                    :rules="formPricePerUnitRules"
                    label="Price Per Unit"
                    type="number"
                    :prefix="currencySymbol"
                    persistent-placeholder
                    placeholder="1.99"
                    outlined
                  ></v-text-field>
                  <v-select
                    class="mt-2"
                    :disabled="saving"
                    :items="categories"
                    v-model="editedItem.categoryId"
                    outlined
                    label="Category"
                  ></v-select>
                  <v-select
                    :disabled="saving"
                    :items="itemUnits"
                    v-model="editedItem.unit"
                    outlined
                    clearable
                    label="Unit"
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
              <template
                v-for="(item, index) in filteredItems.slice(0, itemSize)"
              >
                <v-list-item
                  :key="item.id"
                  @click="onEditItem(item)"
                  class="mb-0"
                >
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name"></v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-overline">
                        {{ categoryNameByItemId(item.id) }}
                      </span>
                      -
                      <span class="text--primary">
                        {{ formatCurrency(item.pricePerUnit) }}
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="d-flex">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click="onEditItem(item)"
                            color="info"
                            class="mr-2"
                            v-bind="attrs"
                            v-on="on"
                            icon
                          >
                            <v-icon>{{ editIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit {{ item.name }}</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            @click.stop="onDeleteItem(item)"
                            color="error"
                            icon
                            v-bind="attrs"
                            v-on="on"
                            class="ml-2"
                          >
                            <v-icon>{{ deleteIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Delete {{ item.name }}</span>
                      </v-tooltip>
                    </div>
                  </v-list-item-action>
                </v-list-item>
                <v-divider
                  class="mt-0"
                  v-if="index < items.length - 1"
                  :key="index"
                ></v-divider>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
        <div
          class="text-center mt-4 mb-4"
          v-if="canLoadMore"
          @click="itemSize += 20"
        >
          <v-btn color="primary">Load More</v-btn>
        </div>
        <v-dialog v-model="dialogDelete" :max-width="dialogWidth" width="400">
          <v-card>
            <v-card-title class="text-h5">
              <div class="text-break">
                Are you sure you want to delete
                <code class="d-inline-block">{{ this.editedItem.name }}</code>
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
  CATEGORY_ID_UNCATEGORIZED,
  Item,
  List,
  UpsertItemRequest,
} from "@/store";
import { dialogWidth } from "@/plugins/vuetify";
import {
  mdiClose,
  mdiMagnify,
  mdiPlus,
  mdiSquare,
  mdiSquareEditOutline,
  mdiTrashCan,
} from "@mdi/js";

@Component
export default class ManageItems extends Vue {
  @Getter("formatCurrency") formatCurrency!: (value: number) => string;
  formNameRules = [
    (value: string | null): boolean | string =>
      (!!value && value.trim() != "") || "Category name is required",
    (value: string | null): boolean | string =>
      (value && value.length <= 15) ||
      "Category name must be less than 15 characters",
  ];

  formPricePerUnitRules = [
    (value: number | null | string): boolean | string =>
      (!Number.isNaN(value) && value != null && value != "" && value >= 0) ||
      "Price per unit must be at least " + this.currencyFormat(0),
  ];
  squareIcon: string = mdiSquare;
  formValid = false;
  formQuery = "";
  itemSize = 20;
  addIcon: string = mdiPlus;
  searchIcon: string = mdiMagnify;
  editIcon: string = mdiSquareEditOutline;
  deleteIcon: string = mdiTrashCan;
  closeIcon: string = mdiClose;
  dialog = false;
  dialogDelete = false;
  editedItem: UpsertItemRequest = {
    name: "",
    unit: "",
    itemId: "",
    pricePerUnit: 0,
    categoryId: CATEGORY_ID_UNCATEGORIZED,
  };

  defaultItem: UpsertItemRequest = {
    name: "",
    itemId: "",
    unit: "",
    pricePerUnit: 0,
    categoryId: CATEGORY_ID_UNCATEGORIZED,
  };
  @Getter("currencySymbol") currencySymbol!: string;
  @Getter("categorySelectItems") categories!: Array<List>;
  @Getter("items") items!: Array<Item>;
  @Getter("itemUnitSelectItems") itemUnits!: string;
  @Getter("saving") saving!: boolean;
  @Getter("itemListsCount") itemListsCount!: (itemId: string) => number;
  @Getter("currency") currency!: string;
  @Getter("findCategoryNameByItemId") categoryNameByItemId!: (
    itemId: string
  ) => string;
  @Action("upsertItem") upsertItem!: (
    request: UpsertItemRequest
  ) => Promise<void>;
  @Action("deleteItem") deleteItem!: (itemId: string) => Promise<void>;
  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("loadState") loadState!: () => Promise<void>;

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  get canLoadMore(): boolean {
    return this.filteredItems.length > this.itemSize;
  }

  get filteredItems(): Array<Item> {
    const query = this.formQuery.trim().toLowerCase();
    if (query === "") {
      return this.items;
    }

    const items = this.items.filter((item) => {
      return (
        item.name.toLowerCase().indexOf(query) !== -1 ||
        this.categoryNameByItemId(item.id).toLowerCase().indexOf(query) !== -1
      );
    });

    console.log("temp", items.length);
    return items;
  }

  get formTitle(): string {
    return this.editedItem.itemId === this.defaultItem.itemId
      ? "Add Item"
      : "Edit Item";
  }

  mounted(): void {
    this.loadState();
    this.setTitle("Manage Items");
  }

  currencyFormat(value: number): string {
    return this.formatCurrency(value);
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
    await this.upsertItem({ ...this.editedItem });
    this.dialog = false;
    this.clearForm();
  }

  onDeleteItem(item: Item): void {
    this.editedItem = { ...item, itemId: item.id };
    this.dialogDelete = true;
  }

  onDeleteListConfirm(): void {
    this.deleteItem(this.editedItem.itemId);
    this.closeDeleteDialog();
  }

  onEditItem(item: Item): void {
    this.editedItem = { ...item, itemId: item.id };
    this.dialog = true;
  }

  clearForm(): void {
    this.editedItem = {
      ...this.defaultItem,
    };
  }
}
</script>
