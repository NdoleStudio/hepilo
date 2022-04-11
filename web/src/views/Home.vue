<template>
  <div>
    <v-responsive max-width="1264" class="mx-auto">
      <v-container>
        <v-row align="center" class="mt-5">
          <v-col
            cols="12"
            lg="4"
            :class="{ 'text-center': $vuetify.breakpoint.mdAndDown }"
          >
            <h1 class="text-h2">
              <span class="lime--text text--darken-2" id="typewriter"
                >Ultimate</span
              >
              <br />
              Shopping List
            </h1>
            <h2 class="text--secondary text-h6 mt-2">
              Easily create and organize multiple shopping lists all in one
              place.
            </h2>
            <v-btn
              color="primary"
              large
              class="mt-4 mb-4"
              :to="{ name: $constants.ROUTE_NAMES.LOGIN }"
            >
              Get Started
            </v-btn>
            <v-btn
              large
              color="secondary"
              class="mt-4 mb-4 ml-4"
              :to="{ name: $constants.ROUTE_NAMES.SHOPPING_LIST_DEMO }"
            >
              Live Demo
            </v-btn>
            <a
              class="ml-n4"
              :href="
                this.appData.androidAppUrl +
                '&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
              "
              ><img
                height="100"
                alt="Get it on Google Play"
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            /></a>
            <div class="mt-4">
              <v-icon color="lime darken-2">{{ tickIcon }}</v-icon>
              FREE to use
              <v-icon class="ml-4" color="lime darken-2">{{ tickIcon }}</v-icon>
              No credit card required
            </div>
            <v-divider
              class="mt-6 mr-16 lime"
              :class="{ 'ml-16': $vuetify.breakpoint.mdAndDown }"
            ></v-divider>
          </v-col>
          <v-col cols="12" lg="8">
            <v-img
              contain
              class="mt-4 mx-auto"
              max-height="600"
              src="@/assets/home-intro-dark.png"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </v-responsive>
    <v-sheet class="mt-10">
      <v-responsive max-width="1264" class="mx-auto">
        <v-container>
          <v-row align="center" class="mt-5 mb-5">
            <v-col
              :order-lg="2"
              cols="12"
              lg="6"
              :class="{ 'text-center': $vuetify.breakpoint.mdAndDown }"
            >
              <h1 class="text-h4">Stay on top of your budget</h1>
              <h2 class="text--secondary text-h6 mt-2">
                Easily track the cost of your shopping list items so you don't
                go above budget.
              </h2>
            </v-col>
            <v-col cols="12" lg="6" :order-lg="1">
              <v-img
                contain
                class="mt-4 mx-auto"
                max-height="800"
                src="@/assets/home-budget-dark.png"
              ></v-img>
            </v-col>
          </v-row>
        </v-container>
      </v-responsive>
    </v-sheet>
    <v-responsive max-width="1264" class="mx-auto">
      <v-container>
        <v-row align="center" class="mt-5">
          <v-col
            cols="12"
            lg="5"
            :class="{ 'text-center': $vuetify.breakpoint.mdAndDown }"
          >
            <h1 class="text-h4">Transparent and 100% open source</h1>
            <h2 class="text--secondary text-h6 mt-2">
              Our source code is available on GitHub under the
              <a
                href="https://opensource.org/licenses/MIT"
                class="text-decoration-none"
                >MIT License</a
              >. Feel free to fork it, twist it, flip it or review it to verify
              that our actions match with our words.
            </h2>
            <div
              class="d-flex align-center"
              :class="{ 'justify-center': $vuetify.breakpoint.mdAndDown }"
            >
              <v-btn class="mt-4 mb-4" :href="githubLInk">
                <v-icon>{{ githubIcon }}</v-icon>
                Github
              </v-btn>
              <a :href="githubLInk" class="ml-3 mt-2">
                <img
                  alt="GitHub Repo stars"
                  src="https://img.shields.io/github/stars/NdoleStudio/hepilo?style=social"
                />
              </a>
            </div>
          </v-col>
          <v-col cols="12" lg="7">
            <v-img
              contain
              class="mt-4 mx-auto"
              max-height="700"
              src="@/assets/home-github-dark.png"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </v-responsive>
    <v-sheet class="mt-10">
      <v-responsive max-width="1264" class="mx-auto">
        <v-container>
          <v-row align="center" class="mt-5 mb-5">
            <v-col class="text-center">
              <h1 class="text-h4 mb-4">I am social</h1>
              <h2 class="text--secondary text-h6 mt-2 mb-4">
                Follow me on twitter to stay updated on the latest features
              </h2>
              <v-btn
                class="text-none"
                color="primary"
                href="https://twitter.com/intent/follow?screen_name=hepilohq"
              >
                <v-icon>{{ twitterIcon }}</v-icon>
                <span class="text--white">Follow @hepilohq</span>
              </v-btn>
              <ul class="mt-6 mb-n6">
                <li class="d-inline">
                  <router-link
                    class="text-decoration-none text--secondary"
                    :to="{ name: $constants.ROUTE_NAMES.BLOG_INDEX }"
                  >
                    Blog
                  </router-link>
                </li>
                <li class="d-inline text-decoration-none ml-4">
                  <router-link
                    class="text-decoration-none text--secondary"
                    :to="{ name: $constants.ROUTE_NAMES.PRIVACY_POLICY }"
                  >
                    Privacy Policy
                  </router-link>
                </li>
                <li class="d-inline ml-4">
                  <router-link
                    class="text-decoration-none text--secondary"
                    :to="{ name: $constants.ROUTE_NAMES.TERMS_AND_CONDITIONS }"
                  >
                    Terms And Conditions
                  </router-link>
                </li>
              </ul>
            </v-col>
          </v-row>
        </v-container>
      </v-responsive>
    </v-sheet>
    <snack-alert :href="appData.androidAppUrl" v-if="canDownloadApp">
      <div class="d-flex">
        <a :href="appData.androidAppUrl">
          <v-img
            contain
            class="rounded-2"
            max-height="50"
            max-width="50"
            :src="
              appData.url + '/img/icons/android-chrome-maskable-192x192.png'
            "
            :alt="appData.name + ' app icon'"
          ></v-img>
        </a>
        <div class="pl-2">
          <h6 class="text-h6 mt-0 mb-0">{{ appData.name }}</h6>
          <p class="mb-0 mt-n1 text--secondary">Get the official App</p>
        </div>
      </div>
    </snack-alert>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import "firebaseui/dist/firebaseui.css";
import { mdiCheckCircle, mdiGithub, mdiLogin, mdiTwitter } from "@mdi/js";
import { Action, Getter } from "vuex-class";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Typewriter from "typewriter-effect/dist/core";
import SnackAlert from "@/components/SnackAlert.vue";
import { AppData } from "@/types/state";
import { isAndroid, isInStandaloneMode } from "@/plugins/utils";
@Component({
  components: { SnackAlert },
})
export default class Home extends Vue {
  loginIcon: string = mdiLogin;
  githubIcon: string = mdiGithub;
  twitterIcon: string = mdiTwitter;
  tickIcon: string = mdiCheckCircle;

  @Getter("appData") appData!: AppData;
  @Action("setTitle") setTitle!: (title: string) => void;

  get githubLInk(): string {
    return process.env.VUE_APP_GITHUB_LINK as string;
  }

  get canDownloadApp(): boolean {
    return isAndroid() && !isInStandaloneMode();
  }

  mounted(): void {
    this.setTitle("");
    new Typewriter("#typewriter", {
      strings: ["Grocery", "Weekly", "Christmas", "Ultimate"],
      autoStart: true,
      loop: true,
    });
  }
}
</script>
