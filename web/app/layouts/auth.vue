<template>
  <v-app>
    <v-app-bar>
      <div class="d-flex align-center cursor-pointer ml-4" @click="navigateTo(localePath('/'))">
        <v-img
          max-height="55"
          width="55"
          :src="logo"
        />
        <h4
          class="ml-2"
          :class="mdAndUp ? 'text-headline-large' : 'text-headline-small'"
        >
          {{ config.public.appName }}
        </h4>
      </div>

      <v-spacer />
      <LanguageSwitcher />
      <v-btn icon @click="toggleTheme">
        <v-icon :icon="isDark ? mdiWeatherSunny : mdiWeatherNight" />
      </v-btn>
      <v-btn
        v-if="lgAndUp && route.name !== 'blog'"
        variant="text"
        class="mr-2 text-none"
        :color="isDark ? 'lime' : 'secondary'"
        :to="localePath('/blog')"
      >
        {{ t('nav.blog') }}
      </v-btn>
      <v-btn
        v-if="!isLoginRoute"
        color="primary"
        variant="flat"
        class="text-none mr-2"
        :to="localePath('/login')"
      >
        {{ t('nav.getStarted') }}
      </v-btn>

      <v-progress-linear
        :active="uiStore.saving"
        :indeterminate="uiStore.saving"
        absolute
        location="bottom"
        color="lime"
      />
    </v-app-bar>

    <v-main>
      <slot />

      <v-snackbar
        v-model="uiStore.isNotificationActive"
        :color="uiStore.notification.type"
        :timeout="uiStore.notification.timeout"
      >
        <v-icon
          v-if="uiStore.notification.type === 'success'"
          :icon="mdiCheck"
          :color="uiStore.notification.type"
          class="mr-2"
        />
        <v-icon
          v-if="uiStore.notification.type === 'info'"
          :icon="mdiInformation"
          :color="uiStore.notification.type"
          class="mr-2"
        />
        {{ uiStore.notification.message }}

        <template #actions>
          <v-btn
            :color="uiStore.notification.type"
            variant="text"
            @click="uiStore.disableNotification()"
          >
            {{ t('common.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>

    <v-footer class="d-flex justify-center align-center ga-4 text-medium-emphasis">
      <NuxtLink class="text-medium-emphasis" :to="localePath('/blog')">
        {{ t('home.footerBlog') }}
      </NuxtLink>
      <NuxtLink class="text-medium-emphasis" :to="localePath('/privacy-policy')">
        {{ t('home.footerPrivacyPolicy') }}
      </NuxtLink>
      <NuxtLink class="text-medium-emphasis" :to="localePath('/terms-and-conditions')">
        {{ t('home.footerTermsAndConditions') }}
      </NuxtLink>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { mdiCheck, mdiInformation, mdiWeatherSunny, mdiWeatherNight } from '@mdi/js'
import logo from '~/assets/images/logo.png'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const route = useRoute()
const uiStore = useUIStore()
const theme = useTheme()
const { mdAndUp, lgAndUp } = useDisplay()

const isDark = computed(() => theme.global.current.value.dark)
const isLoginRoute = computed(() => String(route.name).includes('login'))

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  if (import.meta.client) {
    localStorage.setItem('hepilo-theme', theme.global.name.value)
  }
}

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('hepilo-theme')
    if (saved === 'light' || saved === 'dark') {
      theme.global.name.value = saved
    }
  }
})
</script>
