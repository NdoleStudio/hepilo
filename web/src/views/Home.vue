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
              <span class="lime--text" id="typewriter">Ultimate</span>
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
            <div class="mt-4">
              <v-icon color="lime">{{ tickIcon }}</v-icon>
              FREE to use
              <v-icon class="ml-4" color="lime">{{ tickIcon }}</v-icon>
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
              <v-btn
                class="mt-4 mb-4"
                :to="{ name: $constants.ROUTE_NAMES.LOGIN }"
              >
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
              <h1 class="text-h4 mb-4">We are social</h1>
              <h2 class="text--secondary text-h6 mt-2 mb-4">
                Follow me on twitter to stay updated on the latest features
              </h2>
              <a
                href="https://twitter.com/ndolestudio?ref_src=twsrc%5Etfw"
                class="twitter-follow-button"
                data-show-count="true"
                data-size="large"
                >Follow @NdoleStudio</a
              >
              <ul class="mt-10 mb-n6">
                <li class="d-inline text-decoration-none">
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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import "firebaseui/dist/firebaseui.css";
import { mdiCheckCircle, mdiGithub, mdiLogin } from "@mdi/js";
import { Action } from "vuex-class";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Typewriter from "typewriter-effect/dist/core";

@Component
export default class Home extends Vue {
  loginIcon: string = mdiLogin;
  githubIcon: string = mdiGithub;
  @Action("setTitle") setTitle!: (title: string) => void;

  tickIcon: string = mdiCheckCircle;

  get githubLInk(): string {
    return process.env.VUE_APP_GITHUB_LINK;
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
