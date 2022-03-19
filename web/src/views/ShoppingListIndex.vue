<template>
  <v-container>
    <v-progress-circular
      class="mx-auto d-block my-16"
      :size="100"
      :width="5"
      color="lime"
      indeterminate
    ></v-progress-circular>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { List } from "@/types/state";

@Component
export default class ShoppingListIndex extends Vue {
  @Getter("selectedList") list!: List;

  @Action("loadState") loadState!: () => Promise<void>;

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
