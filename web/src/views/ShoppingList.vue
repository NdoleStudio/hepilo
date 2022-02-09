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
          v-model="item"
          placeholder="Add Item"
          :prepend-inner-icon="addIcon"
        >
        </v-combobox>
      </v-col>
    </v-row>
    <v-row v-if="list.length > 0">
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-list subheader class="pb-0">
          <v-progress-linear
            :active="saving"
            :indeterminate="saving"
            v-if="saving"
            color="deep-purple accent-4"
          ></v-progress-linear>
          <template v-for="categoryItem in list">
            <v-subheader
              class="teal--text text-button"
              :key="'header-' + categoryItem.category.id"
              >{{ categoryItem.category.name }}</v-subheader
            >
            <v-list-item-group
              v-model="selectedItem"
              :key="'list-' + categoryItem.category.id"
            >
              <v-list-item
                @click="itemClicked"
                v-for="item in categoryItem.items"
                :key="item.item.id"
              >
                <v-list-item-action>
                  <v-checkbox></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ item.item.name }}</v-list-item-title>
                  <v-list-item-subtitle class="caption">{{
                    formatCurrency(
                      item.listItem.quantity * item.item.pricePerUnit
                    )
                  }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-spacer></v-spacer>
                <v-list-item-action>
                  <v-btn icon @click="deleteListItem(item.listItem.itemId)">
                    <v-icon color="error">{{ deleteIcon }}</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </template>
        </v-list>
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
          <v-btn icon @click="dialog = false">
            <v-icon>{{ closeIcon }}</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </v-card-text>

        <v-card-actions>
          <v-btn text color="success" @click="dialog = false">Save</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="dialog = false"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { mdiClose, mdiDelete, mdiPlus } from "@mdi/js";
import { MaterializedList } from "@/store";

type SelectItem = string;

@Component
export default class ShoppingList extends Vue {
  addIcon: string = mdiPlus;
  item: string | SelectItem = "";
  isBlur = false;
  deleteIcon: string = mdiDelete;
  selectedItem: null | number = -1;
  dialog = false;
  closeIcon: string = mdiClose;

  @Getter("materializedList") list!: MaterializedList;
  @Getter("currency") currency!: string;
  @Getter("saving") saving!: boolean;
  @Getter("loadingState") loadingState!: boolean;
  @Getter("autocompleteItems") autocompleteItems!: Array<string>;

  @Action("setTitle") setTitle!: (title: string) => void;
  @Action("addItem") addItem!: (name: string) => void;
  @Action("deleteListItem") deleteListItem!: (itemId: string) => void;
  @Action("loadState") loadState!: () => void;

  get dialogWidth(): string {
    switch (this.$vuetify.breakpoint.name) {
      case "md":
        return "500";
      case "lg":
        return "600";
      case "xl":
        return "780";
      default:
        return "90%";
    }
  }

  mounted(): void {
    this.setTitle("Shopping List");
    this.loadState();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: this.currency,
    }).format(value);
  }

  itemSelected(event: Event): void {
    event.stopPropagation();
  }

  onFocus(): void {
    this.isBlur = false;
  }

  onBlur(): void {
    this.isBlur = true;
  }

  itemClicked(): void {
    this.dialog = true;
    setTimeout(() => {
      this.selectedItem = null;
    }, 200);
  }

  onChange(chosenItem: string): void {
    if (!this.isBlur) {
      this.addItem(chosenItem);
    }
    this.$nextTick(() => {
      this.item = "";
    });
  }
}
</script>
