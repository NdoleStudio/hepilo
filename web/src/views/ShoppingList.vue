<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-combobox
          filled
          @change="onChange"
          @blur="onBlur"
          @focus="onFocus"
          :items="autocompleteItems"
          solo
          :auto-select-first="true"
          v-model="itemName"
          placeholder="Add Item"
          :prepend-inner-icon="addIcon"
        >
        </v-combobox>
      </v-col>
    </v-row>
    <v-row v-if="listItems.length > 0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card tile>
          <v-card-text class="px-0 py-0">
            <v-list subheader class="pb-0">
              <v-progress-linear
                :active="saving"
                :indeterminate="saving"
                v-if="saving"
                color="deep-purple accent-4"
              ></v-progress-linear>
              <template v-for="categoryItem in listItems">
                <v-subheader
                  class="text-button"
                  :class="categoryClass(categoryItem.category)"
                  :key="'header-' + categoryItem.category.id"
                  >{{ categoryItem.category.name }}</v-subheader
                >
                <v-list-item-group
                  class="left-color"
                  v-model="selectedItem"
                  :key="'list-' + categoryItem.category.id"
                >
                  <v-list-item
                    @click="itemClicked(item)"
                    v-for="item in categoryItem.items"
                    :key="item.item.id"
                  >
                    <v-list-item-action>
                      <v-checkbox
                        @click.stop
                        @change="addToCart(item.item.id)"
                        :disabled="saving"
                      ></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.item.name }}
                        <span
                          v-if="item.listItem.quantity > 1 || item.item.unit"
                          class="text--secondary"
                        >
                          ({{
                            item.listItem.quantity +
                            (item.item.unit
                              ? " " +
                                unitName(item.item.unit, item.listItem.quantity)
                              : "")
                          }})
                        </span>
                      </v-list-item-title>
                      <v-list-item-subtitle class="caption">{{
                        formatCurrency(
                          item.listItem.quantity * item.item.pricePerUnit
                        )
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            icon
                            @click="deleteListItem(item.listItem.itemId)"
                          >
                            <v-icon color="error">{{ deleteIcon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>Delete</span>
                      </v-tooltip>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="cartItems.length > 0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-expansion-panels :value="cartPanel" tile>
          <v-expansion-panel @change="toggleCartPanel">
            <v-expansion-panel-header class="text-button pl-4">
              <div>
                Cart
                <v-icon small>{{ cartIcon }}</v-icon>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="mx-n6">
              <v-list subheader class="mb-n4 pb-0">
                <template v-for="categoryItem in cartItems">
                  <v-list-item-group
                    v-model="selectedItem"
                    :key="'list-' + categoryItem.category.id"
                  >
                    <v-list-item
                      @click="itemClicked(item)"
                      v-for="item in categoryItem.items"
                      :key="item.item.id"
                    >
                      <v-list-item-action>
                        <v-checkbox
                          @click.stop
                          :disabled="saving"
                          input-value="true"
                          @change="removeFromCart(item.item.id)"
                        ></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title
                          class="text-decoration-line-through text--secondary"
                        >
                          {{ item.item.name }}
                          <span
                            v-if="item.listItem.quantity > 1 || item.item.unit"
                            class="text--secondary"
                          >
                            ({{
                              item.listItem.quantity +
                              (item.item.unit
                                ? " " +
                                  unitName(
                                    item.item.unit,
                                    item.listItem.quantity
                                  )
                                : "")
                            }})
                          </span>
                        </v-list-item-title>
                        <v-list-item-subtitle class="caption">{{
                          formatCurrency(
                            item.listItem.quantity * item.item.pricePerUnit
                          )
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn
                          icon
                          @click="deleteListItem(item.listItem.itemId)"
                        >
                          <v-icon color="error">{{ deleteIcon }}</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list-item-group>
                </template>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-row v-if="cartTotal > 0.0 || listTotal > 0.0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-card tile>
          <v-card-text class="pb-0">
            <v-row>
              <v-col>
                <div class="d-flex mb-n2" style="width: 100%">
                  <div>
                    <p class="text-button">List Total</p>
                    <p class="text-h6 mt-n5">{{ formatCurrency(listTotal) }}</p>
                  </div>
                  <v-spacer></v-spacer>
                  <div>
                    <p class="text-button text-right">Cart Total</p>
                    <p class="text-h6 mt-n5">
                      {{ formatCurrency(cartTotal) }}
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialog"
      max-width="90%"
      :width="dialogWidth"
      transition="scale-transition"
    >
      <v-card>
        <v-card-title>
          <v-spacer></v-spacer>
          <v-btn color="info" icon @click="closePopup">
            <v-icon>{{ closeIcon }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form v-model="formValid" lazy-validation ref="updateItemForm">
            <v-text-field
              aria-required="true"
              :disabled="saving"
              v-model="formName"
              :rules="formNameRules"
              label="Name"
              counter="15"
              persistent-placeholder
              placeholder="e.g Bread"
              outlined
            ></v-text-field>
            <div class="d-flex mt-2">
              <v-text-field
                :disabled="saving"
                aria-required="true"
                v-model="formQuantity"
                :rules="formQuantityRules"
                label="Quantity"
                type="number"
                persistent-placeholder
                placeholder="e.g 1"
                outlined
              ></v-text-field>
              <v-select
                class="ml-3"
                :disabled="saving"
                :items="itemUnits"
                v-model="formUnit"
                outlined
                clearable
                label="Unit"
              ></v-select>
            </div>
            <v-text-field
              class="mt-2"
              :disabled="saving"
              aria-required="true"
              v-model="formPricePerUnit"
              :rules="formPricePerUnitRules"
              label="Price Per Unit"
              type="number"
              :prefix="currencySymbol"
              persistent-placeholder
              placeholder="1.99"
              :hint="'Total Price: ' + formatCurrency(totalPrice)"
              :persistent-hint="totalPrice > 0"
              outlined
            ></v-text-field>
            <v-select
              class="mt-2"
              :disabled="saving"
              :items="categorySelectItems"
              v-model="formCategoryId"
              outlined
              label="Category"
            ></v-select>
            <v-textarea
              class="mt-2"
              :disabled="saving"
              counter="300"
              v-model="formNotes"
              :rules="formNotesRules"
              label="Notes"
              persistent-placeholder
              placeholder=""
              outlined
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="success"
            :disabled="!formValid || saving"
            @click="onSave"
            >Save</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="onPopupDelete"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { mdiCart, mdiClose, mdiDelete, mdiPlus } from "@mdi/js";
import {
  Category,
  CATEGORY_ID_UNCATEGORIZED,
  List,
  MaterializedList,
  MaterializedListItem,
  SelectItem,
  UpdateItemRequest,
} from "@/store";
import { dialogWidth } from "@/plugins/vuetify";

@Component
export default class ShoppingList extends Vue {
  itemName = "";
  isBlur = false;
  deleteIcon: string = mdiDelete;
  selectedItem: null | number = -1;
  dialog = false;
  formValid = false;
  cartIcon: string = mdiCart;
  addIcon: string = mdiPlus;
  closeIcon: string = mdiClose;
  formItemId = "";
  formName = "";
  formAddedToCart = false;
  formCategoryId = CATEGORY_ID_UNCATEGORIZED;
  formUnit = "";
  formNameRules = [
    (value: string | null): boolean | string =>
      (!!value && value.trim() != "") || "Name is required",
    (value: string | null): boolean | string =>
      (value && value.length <= 15) || "Name must be less than 15 characters",
  ];
  formQuantity = 1;
  formQuantityRules = [
    (value: number | null): boolean | string =>
      !!value || "Quantity is required",
    (value: number | null): boolean | string =>
      (value && value > 0 && value <= 100) ||
      "Quantity must be between 1 and 100",
  ];
  formPricePerUnit = 0.0;
  formPricePerUnitRules = [
    (value: number | null | string): boolean | string =>
      (!Number.isNaN(value) && value != null && value != "" && value >= 0) ||
      "Price per unit must be at least " + this.currencyFormat(0),
  ];
  formNotes = "";
  formNotesRules = [
    (value: string | null): boolean | string =>
      !value ||
      (value && value.length <= 300) ||
      "Notes must be less than 300 characters",
  ];

  @Getter("cartPanel") cartPanel!: number;
  @Getter("listMaterializedItems") listItems!: MaterializedList;
  @Getter("cartMaterializedItems") cartItems!: MaterializedList;
  @Getter("selectedList") list!: List;
  @Getter("cartTotal") cartTotal!: number;
  @Getter("listTotal") listTotal!: number;
  @Getter("currency") currency!: string;
  @Getter("itemUnitSelectItems") itemUnits!: string;
  @Getter("saving") saving!: boolean;
  @Getter("currencySymbol") currencySymbol!: string;
  @Getter("loadingState") loadingState!: boolean;
  @Getter("listExists") listExists!: (listId: string) => boolean;
  @Getter("itemUnitName") unitName!: (unit: string, quantity: number) => string;
  @Getter("formatCurrency") formatCurrency!: (value: number) => string;
  @Getter("autocompleteItems") autocompleteItems!: Array<SelectItem>;
  @Getter("categorySelectItems") categorySelectItems!: Array<SelectItem>;

  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("addItem") addItem!: (name: string) => void;
  @Action("updateItem") updateItem!: (request: UpdateItemRequest) => void;
  @Action("deleteListItem") deleteListItem!: (itemId: string) => void;
  @Action("loadState") loadState!: () => Promise<void>;
  @Action("toggleCartPanel") toggleCartPanel!: () => void;
  @Action("addToCart") addToCart!: (itemId: string) => void;
  @Action("removeFromCart") removeFromCart!: (itemId: string) => void;
  @Action("setSelectedListId") setSelectedListId!: (listId: string) => void;
  @Action("setTitleByListId") setTitleByListId!: (listId: string) => void;

  get dialogWidth(): string {
    return dialogWidth(this.$vuetify.breakpoint.name);
  }

  closePopup(): void {
    this.clearForm();
    this.dialog = false;
  }

  onPopupDelete(): void {
    this.deleteListItem(this.formItemId);
    this.closePopup();
  }

  clearForm(): void {
    this.formName = "";
    this.formQuantity = 1;
    this.formNotes = "";
    this.formItemId = "";
    this.formCategoryId = CATEGORY_ID_UNCATEGORIZED;
    this.formPricePerUnit = 0.0;
    this.formAddedToCart = false;
    this.formUnit = "";
  }

  setFormItem(item: MaterializedListItem): void {
    this.formItemId = item.item.id;
    this.formName = item.item.name;
    this.formQuantity = item.listItem.quantity;
    this.formNotes = item.listItem.notes;
    this.formCategoryId = item.item.categoryId;
    this.formPricePerUnit = item.item.pricePerUnit;
    this.formAddedToCart = item.listItem.addedToCart;
    this.formUnit = item.item.unit ?? "";
  }

  mounted(): void {
    this.loadState().then(() => {
      this.setTitle(this.list.name);
      if (this.list.id !== this.$route.params.listId) {
        if (!this.listExists(this.$route.params.listId)) {
          this.$router.push({
            name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW,
            params: {
              listId: this.list.id,
            },
          });
        } else {
          this.setSelectedListId(this.$route.params.listId);
          this.setTitleByListId(this.$route.params.listId);
        }
      }
    });
  }

  @Watch("$route.params.listId")
  onListIdChange(newListId: string): void {
    this.setSelectedListId(newListId);
    this.setTitleByListId(newListId);
  }

  get totalPrice(): number {
    return this.formPricePerUnit * this.formQuantity;
  }

  categoryClass(category: Category): { [p: string]: boolean } {
    return {
      [`${category.color || "teal"}--text`]: true,
    };
  }

  itemSelected(event: Event): void {
    event.stopPropagation();
  }

  currencyFormat(value: number): string {
    return this.formatCurrency(value);
  }

  onFocus(): void {
    this.isBlur = false;
  }

  onBlur(): void {
    this.isBlur = true;
  }

  onSave(): void {
    this.updateItem({
      itemId: this.formItemId,
      name: this.formName,
      categoryId: this.formCategoryId,
      quantity: this.formQuantity,
      notes: this.formNotes,
      unit: this.formUnit,
      pricePerUnit: this.formPricePerUnit,
      addedToCart: this.formAddedToCart,
    });
    this.dialog = false;
    this.clearForm();
  }

  itemClicked(item: MaterializedListItem): void {
    this.setFormItem(item);
    this.dialog = true;
    setTimeout(() => {
      this.selectedItem = null;
    }, 200);
  }

  onChange(chosenItem: string | SelectItem): void {
    let old = "";
    if (!this.isBlur) {
      if (typeof chosenItem == "string") {
        if (chosenItem.trim().length > 15) {
          old = chosenItem.trim();
        }
        this.addItem(chosenItem);
      } else {
        this.addItem(chosenItem.text);
      }
    }
    this.$nextTick(() => {
      this.itemName = old;
    });
  }
}
</script>
