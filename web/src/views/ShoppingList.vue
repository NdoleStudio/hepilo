<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-combobox
          filled
          @change="onChange"
          @blur="onBlur"
          :items="items"
          solo
          v-model="item"
          placeholder="Add Item"
          :prepend-inner-icon="addIcon"
        >
        </v-combobox>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="6" md="8" offset-md="2" offset-lg="3">
        <v-list subheader two-line>
          <v-subheader class="green--text text-button">Dairy</v-subheader>
          <v-list-item-group v-model="selectedItem" active-class="">
            <v-list-item @click="itemClicked" :value="1">
              <v-list-item-action>
                <v-checkbox></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Eggs</v-list-item-title>
                <v-list-item-subtitle class="caption">
                  100 FCFA
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-spacer></v-spacer>
              <v-list-item-action>
                <v-btn icon>
                  <v-icon color="error">{{ deleteIcon }}</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item :value="2">
              <v-list-item-action>
                <v-checkbox></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Beans</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-subheader class="yellow--text text-button">Vegetables</v-subheader>
          <v-list-item-group color="primary">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Tomatoes</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Carrots</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";
import { mdiDelete, mdiPlus } from "@mdi/js";

interface SelectItem {
  text: string;
  value: string;
}

@Component
export default class ShoppingList extends Vue {
  @Action("setTitle") setTitle!: (title: string) => void;
  addIcon: string = mdiPlus;
  item: string | SelectItem = "";
  isBlur = false;
  deleteIcon: string = mdiDelete;
  items: Array<SelectItem> = [];
  selectedItem: null | number = -1;

  mounted(): void {
    this.setTitle("Shopping List");
    this.setItems();
  }

  itemSelected(event: Event): void {
    event.stopPropagation();
  }

  setItems(): void {
    this.items = [
      {
        text: "Bread",
        value: "Bread-1",
      },
      {
        text: "Bread-2",
        value: "Bread-2",
      },
      {
        text: "Eggs",
        value: "Eggs",
      },
    ];
  }

  onInput(): void {
    this.isBlur = false;
  }

  onBlur(): void {
    this.isBlur = true;
  }

  itemClicked(event: any): void {
    setTimeout(() => {
      this.selectedItem = null;
    }, 1000);
  }
  onChange(chosenItem: SelectItem | string): void {
    console.log(this.isBlur);
    console.log(this.item);
    this.$nextTick(() => {
      this.item = "";
    });
  }
}
</script>
