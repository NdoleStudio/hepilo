<template>
  <v-container>
    <v-row>
      <v-col cols="12" xl="6" md="8" offset-md="2" offset-xl="3">
        <v-progress-circular
          class="mx-auto d-block my-16"
          :size="100"
          :width="5"
          v-if="loading && blogEntries.length === 0"
          color="lime"
          indeterminate
        ></v-progress-circular>
        <v-hover
          v-slot:default="{ hover }"
          :key="blogEntry.id"
          v-for="blogEntry in blogEntries"
        >
          <v-card
            :class="{ 'hover-opacity': hover }"
            class="mb-4"
            :elevation="hover ? 4 : 1"
            :to="{ name: $constants.ROUTE_NAMES.HOME }"
          >
            <v-card-title class="text-h4 break-word">{{
              blogEntry.title
            }}</v-card-title>
            <v-card-subtitle class="text-uppercase caption">
              <span class="lime--text text--darken-2">{{
                blogEntry.timestamp | date
              }}</span
              ><span> • {{ blogEntry.readMinutes }} min read</span>
            </v-card-subtitle>
            <v-card-text>
              <p class="text--primary">{{ blogEntry.intro }}</p>
            </v-card-text>
          </v-card>
        </v-hover>
        <div class="text-center mt-4">
          <back-button></back-button>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import "firebaseui/dist/firebaseui.css";
import { Action, Getter } from "vuex-class";
import BackButton from "@/components/BackButton.vue";
import { BlogEntry } from "@/plugins/notion";
import { AppData } from "@/store";

@Component({
  components: { BackButton },
})
export default class BlogIndex extends Vue {
  @Getter("loading") loading!: boolean;
  @Getter("appData") appData!: AppData;
  @Getter("blogEntries") blogEntries!: Array<BlogEntry>;
  @Action("loadBlogState") loadBlogState!: () => Promise<void>;
  @Action("setPageTitle") setPageTitle!: (title: string) => Promise<void>;

  mounted(): void {
    this.loadBlogState();
    this.setPageTitle(`Blog`);
  }
}
</script>
