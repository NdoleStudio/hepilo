<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()

const appName = config.public.appName as string
const appUrl = config.public.siteUrl as string

definePageMeta({ layout: 'auth' })

useSeoDefaults({
  title: t('legal.privacyTitle'),
  description: t('legal.privacySeoDescription'),
  path: '/privacy-policy',
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="8"
        offset-md="2"
        xxl="6"
        offset-xxl="3"
      >
        <h1 class="text-display-large mb-6">{{ $t('legal.privacyTitle') }}</h1>
        <div class="break-word">
            <p>
              {{ $t('legal.privacyIntro', { appName }) }}
              <a :href="appUrl">{{ appUrl }}</a>{{ $t('legal.privacyIntroSuffix', { appName }) }}
            </p>
            <p>{{ $t('legal.privacyContact') }}</p>
            <p>{{ $t('legal.privacyScope', { appName }) }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.consentTitle') }}</h2>
            <p>
              {{ $t('legal.consentText') }}
              <NuxtLink :to="localePath('/terms-and-conditions')">{{ $t('legal.consentLink') }}</NuxtLink>.
            </p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.infoCollectTitle') }}</h2>
            <p>{{ $t('legal.infoCollectText1') }}</p>
            <p>{{ $t('legal.infoCollectText2') }}</p>
            <p>{{ $t('legal.infoCollectText3') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.infoUseTitle') }}</h2>
            <p>{{ $t('legal.infoUseIntro') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.infoUse1') }}</li>
              <li>{{ $t('legal.infoUse2') }}</li>
              <li>{{ $t('legal.infoUse3') }}</li>
              <li>{{ $t('legal.infoUse4') }}</li>
              <li>{{ $t('legal.infoUse5') }}</li>
              <li>{{ $t('legal.infoUse6') }}</li>
              <li>{{ $t('legal.infoUse7') }}</li>
            </ul>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.logFilesTitle') }}</h2>
            <p>{{ $t('legal.logFilesText', { appName }) }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.cookiesBeaconsTitle') }}</h2>
            <p>{{ $t('legal.cookiesBeaconsText1', { appName }) }}</p>
            <p>{{ $t('legal.cookiesBeaconsText2') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.adPartnersTitle') }}</h2>
            <p>{{ $t('legal.adPartnersText1', { appName }) }}</p>
            <p>{{ $t('legal.adPartnersText2', { appName }) }}</p>
            <p>{{ $t('legal.adPartnersText3', { appName }) }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.thirdPartyTitle') }}</h2>
            <p>{{ $t('legal.thirdPartyText1', { appName }) }}</p>
            <p>{{ $t('legal.thirdPartyText2') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.ccpaTitle') }}</h2>
            <p>{{ $t('legal.ccpaText1') }}</p>
            <p>{{ $t('legal.ccpaText2') }}</p>
            <p>{{ $t('legal.ccpaText3') }}</p>
            <p>{{ $t('legal.ccpaText4') }}</p>
            <p>{{ $t('legal.ccpaText5') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.gdprTitle') }}</h2>
            <p>{{ $t('legal.gdprText1') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.gdprAccess') }}</li>
              <li>{{ $t('legal.gdprRectification') }}</li>
              <li>{{ $t('legal.gdprErasure') }}</li>
              <li>{{ $t('legal.gdprRestrict') }}</li>
              <li>{{ $t('legal.gdprObject') }}</li>
              <li>{{ $t('legal.gdprPortability') }}</li>
            </ul>
            <p>{{ $t('legal.gdprContact') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.childrenTitle') }}</h2>
            <p>{{ $t('legal.childrenText1') }}</p>
            <p>{{ $t('legal.childrenText2', { appName }) }}</p>
          </div>
        <div class="px-16">
          <v-divider class="mt-8" color="primary" />
        </div>
        <div class="text-center mt-4">
          <BackButton />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
