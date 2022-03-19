<template>
  <v-container>
    <v-row>
      <v-col cols="12" xl="6" md="8" offset-md="2" offset-xl="3">
        <v-progress-circular
          class="mx-auto d-block my-16"
          :size="100"
          :width="5"
          v-if="loadingBlog"
          color="lime"
          indeterminate
        ></v-progress-circular>
        <h1 class="text-h3 mb-8 mt-8" v-if="!loadingBlog">
          {{ blogEntry.title }}
        </h1>
        <p class="text-h6 text-none text--secondary" v-if="!loadingBlog">
          {{ blogEntry.intro }}
        </p>
        <div v-if="!loadingBlog">
          <template v-for="block in blocks">
            <p v-if="block.type === 'paragraph'" class="mb-8" :key="block.id">
              <template v-for="content in block.contents">
                <a
                  :href="content.href"
                  v-if="content.href"
                  class="lime--text"
                  :key="content.id"
                  >{{ content.text }}</a
                >
                <span
                  v-else-if="content.bold"
                  class="font-weight-bold"
                  :key="content.id"
                  >{{ content.text }}</span
                >
                <span v-else :key="content.id">{{ content.text }}</span>
              </template>
            </p>
            <v-img
              :src="block.image"
              v-if="block.type === 'image'"
              :key="block.id"
              contain
              class="mx-auto"
              max-height="700"
            ></v-img>
            <h2
              class="text-h4 mb-1 mt-4"
              v-if="block.type === 'heading_2'"
              :key="block.id"
            >
              {{ block.contents[0].text }}
            </h2>
            <p v-if="block.type === 'quote'" :key="block.id" class="subtitle-1">
              {{ block.contents[0].text }}
            </p>
          </template>
        </div>
        <v-divider class="lime mt-8" v-if="!loadingBlog"></v-divider>
        <div class="text-center mt-4" v-if="!loadingBlog">
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
import { BlogEntry, AppData, NotificationRequest, Block } from "@/types/state";
import { getBlocks } from "@/plugins/notion";

@Component({
  components: { BackButton },
})
export default class BlogShow extends Vue {
  blocks: Array<Block> = [];
  blogEntry: BlogEntry | null = null;
  loadingBlog = true;
  @Getter("loading") loading!: boolean;
  @Getter("appData") appData!: AppData;
  @Getter("blogEntries") blogEntries!: Array<BlogEntry>;
  @Getter("blogEntryFromSlug") blogEntryFromSlug!: (
    slug: string
  ) => BlogEntry | null;

  @Action("loadBlogState") loadBlogState!: () => Promise<void>;
  @Action("setPageTitle") setPageTitle!: (title: string) => Promise<void>;
  @Action("addNotification") addNotification!: (
    request: NotificationRequest
  ) => void;

  mounted(): void {
    this.loadBlogState().then(async () => {
      this.blogEntry = this.blogEntryFromSlug(this.$route.params.slug);
      if (!this.blogEntry) {
        this.addNotification({
          type: "error",
          message: "The blog post does not exist",
        });
        await this.$router.push({
          name: this.$constants.ROUTE_NAMES.BLOG_INDEX,
        });
        return;
      }

      await this.setPageTitle(this.blogEntry.title);
      this.blocks = await getBlocks(this.blogEntry.id);
      this.loadingBlog = false;
    });
  }
}
</script>
