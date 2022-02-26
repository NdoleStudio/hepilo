<template>
  <v-container>
    <v-progress-circular
      class="mx-auto d-block my-16"
      :size="100"
      :width="5"
      color="deep-purple accent-4"
      indeterminate
    ></v-progress-circular>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { List, MaterializedList, SelectItem, UpdateItemRequest } from "@/store";

@Component
export default class ShoppingListIndex extends Vue {
  @Getter("cartPanel") cartPanel!: number;
  @Getter("listMaterializedItems") listItems!: MaterializedList;
  @Getter("cartMaterializedItems") cartItems!: MaterializedList;
  @Getter("selectedList") list!: List;
  @Getter("cartTotal") cartTotal!: number;
  @Getter("listTotal") listTotal!: number;
  @Getter("currency") currency!: string;
  @Getter("saving") saving!: boolean;
  @Getter("currencySymbol") currencySymbol!: string;
  @Getter("loadingState") loadingState!: boolean;
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

  mounted(): void {
    this.loadState().then(() => {
      this.$router.push({
        name: this.$constants.ROUTE_NAMES.SHOPPING_LIST_SHOW,
        params: {
          listId: this.list.id,
        },
      });
    });
  }
}
</script>
