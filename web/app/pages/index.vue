<script setup lang="ts">
import { mdiCheckCircle, mdiGithub, mdiTwitter } from '@mdi/js'
import Typewriter from 'typewriter-effect/dist/core'
import homeIntroDark from '~/assets/images/home-intro-dark.png'
import homeBudgetDark from '~/assets/images/home-budget-dark.png'
import homeGithubDark from '~/assets/images/home-github-dark.png'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { mdAndDown } = useDisplay()

useSeoDefaults({
  title: t('home.heroTitle'),
  description: t('home.heroSubtitle'),
  path: '/',
})

const githubLink = computed(() => config.public.githubLink as string)
const androidAppUrl = computed(() => config.public.siteAndroidAppUrl as string)
const appName = computed(() => config.public.appName as string)
const appIconUrl = '/img/icons/android-chrome-maskable-192x192.png'

const googlePlayBadgeUrl = computed(() =>
  `${androidAppUrl.value}&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1`,
)

const typewriterDefault = computed(() => {
  const raw = tm('home.typewriterStrings')
  if (Array.isArray(raw) && raw.length > 0) {
    return rt(raw[raw.length - 1])
  }
  return 'Ultimate'
})

const showGooglePlayBadge = ref(true)
const canDownloadApp = ref(false)

onMounted(() => {
  const { isInStandaloneMode, isAndroid } = useUtils()
  showGooglePlayBadge.value = !isInStandaloneMode()
  canDownloadApp.value = isAndroid() && !isInStandaloneMode()

  const raw = tm('home.typewriterStrings')
  const strings = Array.isArray(raw) ? raw.map(s => rt(s)) : []
  new Typewriter('#typewriter', {
    strings,
    autoStart: true,
    loop: true,
  })
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-responsive max-width="1264" class="mx-auto">
      <v-container>
        <v-row align="center" class="mt-5">
          <v-col
            cols="12"
            lg="4"
            :class="{ 'text-center': mdAndDown }"
          >
            <h1 class="text-display-medium">
              <span id="typewriter" class="text-lime-darken-2">{{ typewriterDefault }}</span>
              <br>
              {{ t('home.heroTitle') }}
            </h1>
            <h2 class="text-medium-emphasis text-title-large mt-2">
              {{ t('home.heroSubtitle') }}
            </h2>
            <v-btn
              color="primary"
              size="large"
              class="mt-4 mb-4"
              :to="localePath('/login')"
            >
              {{ t('home.getStarted') }}
            </v-btn>
            <v-btn
              size="large"
              color="secondary"
              class="mt-4 mb-4 ml-4"
              :to="localePath('/demo')"
            >
              {{ t('home.liveDemo') }}
            </v-btn>
            <a
              v-if="showGooglePlayBadge"
              class="ml-n4"
              :href="googlePlayBadgeUrl"
            >
              <img
                height="100"
                :alt="t('home.getItOnGooglePlay')"
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              >
            </a>
            <div class="mt-4">
              <v-icon color="lime-darken-2" :icon="mdiCheckCircle" />
              {{ t('home.freeToUse') }}
              <v-icon class="ml-4" color="lime-darken-2" :icon="mdiCheckCircle" />
              {{ t('home.noCreditCard') }}
            </div>
            <v-divider
              class="mt-6 mr-16"
              :class="{ 'ml-16': mdAndDown }"
              color="lime"
            />
          </v-col>
          <v-col cols="12" lg="8">
            <v-img
              class="mt-4 mx-auto"
              max-height="600"
              :src="homeIntroDark"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-responsive>

    <!-- Budget Section -->
    <v-sheet class="mt-10">
      <v-responsive max-width="1264" class="mx-auto">
        <v-container>
          <v-row align="center" class="mt-5 mb-5">
            <v-col
              cols="12"
              lg="6"
              class="order-lg-2"
              :class="{ 'text-center': mdAndDown }"
            >
              <h1 class="text-headline-large">{{ t('home.budgetTitle') }}</h1>
              <h2 class="text-medium-emphasis text-title-large mt-2">
                {{ t('home.budgetSubtitle') }}
              </h2>
            </v-col>
            <v-col cols="12" lg="6" class="order-lg-1">
              <v-img
                class="mt-4 mx-auto"
                max-height="800"
                :src="homeBudgetDark"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-responsive>
    </v-sheet>

    <!-- Open Source Section -->
    <v-responsive max-width="1264" class="mx-auto">
      <v-container>
        <v-row align="center" class="mt-5">
          <v-col
            cols="12"
            lg="5"
            :class="{ 'text-center': mdAndDown }"
          >
            <h1 class="text-headline-large">{{ t('home.openSourceTitle') }}</h1>
            <h2 class="text-medium-emphasis text-title-large mt-2">
              {{ t('home.openSourceSubtitle') }}
              <a
                href="https://opensource.org/licenses/MIT"
                class="text-decoration-none"
              >{{ t('home.mitLicense') }}</a>{{ t('home.openSourceSubtitleSuffix') }}
            </h2>
            <div
              class="d-flex align-center"
              :class="{ 'justify-center': mdAndDown }"
            >
              <a :href="githubLink" class="ml-3 mt-2">
                <img
                  alt="GitHub Repo stars"
                  src="https://img.shields.io/github/stars/NdoleStudio/hepilo?style=social"
                >
              </a>
            </div>
          </v-col>
          <v-col cols="12" lg="7">
            <v-img
              class="mt-4 mx-auto"
              max-height="700"
              :src="homeGithubDark"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-responsive>

    <!-- Social Section -->
    <v-sheet class="mt-10">
      <v-responsive max-width="1264" class="mx-auto">
        <v-container>
          <v-row align="center" class="mt-5 mb-5">
            <v-col class="text-center">
              <h1 class="text-headline-large mb-4">{{ t('home.socialTitle') }}</h1>
              <h2 class="text-medium-emphasis text-title-large mt-2 mb-4">
                {{ t('home.socialSubtitle') }}
              </h2>
              <v-btn
                class="text-none"
                color="primary"
                href="https://twitter.com/intent/follow?screen_name=hepilohq"
              >
                <v-icon :icon="mdiTwitter" />
                <span>{{ t('home.followOnTwitter') }}</span>
              </v-btn>
              <ul class="mt-6 mb-n6">
                <li class="d-inline">
                  <NuxtLink
                    class="text-decoration-none text-medium-emphasis"
                    :to="localePath('/blog')"
                  >
                    {{ t('home.footerBlog') }}
                  </NuxtLink>
                </li>
                <li class="d-inline text-decoration-none ml-4">
                  <NuxtLink
                    class="text-decoration-none text-medium-emphasis"
                    :to="localePath('/privacy-policy')"
                  >
                    {{ t('home.footerPrivacyPolicy') }}
                  </NuxtLink>
                </li>
                <li class="d-inline ml-4">
                  <NuxtLink
                    class="text-decoration-none text-medium-emphasis"
                    :to="localePath('/terms-and-conditions')"
                  >
                    {{ t('home.footerTermsAndConditions') }}
                  </NuxtLink>
                </li>
              </ul>
            </v-col>
          </v-row>
        </v-container>
      </v-responsive>
    </v-sheet>

    <!-- Android App Download Banner -->
    <SnackAlert v-if="canDownloadApp" :href="androidAppUrl">
      <div class="d-flex">
        <a :href="androidAppUrl">
          <v-img
            class="rounded-lg"
            max-height="50"
            max-width="50"
            :src="appIconUrl"
            :alt="appName + ' app icon'"
          />
        </a>
        <div class="pl-2">
          <h6 class="text-title-large mt-0 mb-0">{{ appName }}</h6>
          <p class="mb-0 mt-n1 text-medium-emphasis">{{ t('app.getTheOfficialApp') }}</p>
        </div>
      </div>
    </SnackAlert>
  </div>
</template>
