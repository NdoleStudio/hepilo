<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()

const appName = config.public.appName as string
const appUrl = config.public.siteUrl as string

definePageMeta({ layout: 'auth' })

useSeoDefaults({
  title: t('legal.termsTitle'),
  description: t('legal.termsSeoDescription'),
  path: '/terms-and-conditions',
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
        <h1 class="text-display-large mb-6">{{ $t('legal.termsTitle') }}</h1>
        <div class="break-word">
            <p>
              {{ $t('legal.termsIntro', { appName }) }}
              <a :href="appUrl">{{ appUrl }}</a>.
            </p>
            <p>{{ $t('legal.termsAcceptance', { appName }) }}</p>
            <p>{{ $t('legal.termsTerminology') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.cookiesTitle') }}</h2>
            <p>
              {{ $t('legal.cookiesText1', { appName }) }}
              <a href="https://firebase.google.com/support/privacy" target="_blank">{{ $t('legal.cookiesFirebaseLink') }}</a>.
            </p>
            <p>{{ $t('legal.cookiesText2') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.licenseTitle') }}</h2>
            <p>{{ $t('legal.licenseText1', { appName }) }}</p>
            <p>{{ $t('legal.licenseRestrictions') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.licenseRestriction1', { appName }) }}</li>
              <li>{{ $t('legal.licenseRestriction2', { appName }) }}</li>
              <li>{{ $t('legal.licenseRestriction3', { appName }) }}</li>
              <li>{{ $t('legal.licenseRestriction4', { appName }) }}</li>
            </ul>
            <p>{{ $t('legal.licenseCommentsText1', { appName }) }}</p>
            <p>{{ $t('legal.licenseCommentsText2', { appName }) }}</p>
            <p>{{ $t('legal.licenseWarranty') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.licenseWarranty1') }}</li>
              <li>{{ $t('legal.licenseWarranty2') }}</li>
              <li>{{ $t('legal.licenseWarranty3') }}</li>
              <li>{{ $t('legal.licenseWarranty4') }}</li>
            </ul>
            <p>{{ $t('legal.licenseGrant', { appName }) }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.hyperlinkingTitle') }}</h2>
            <p>{{ $t('legal.hyperlinkingText1') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.hyperlinkingOrg1') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg2') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg3') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg4') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg5') }}</li>
            </ul>
            <p>{{ $t('legal.hyperlinkingText2') }}</p>
            <p>{{ $t('legal.hyperlinkingText3') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.hyperlinkingOrg6') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg7') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg8') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg9') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg10') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg11') }}</li>
              <li>{{ $t('legal.hyperlinkingOrg12') }}</li>
            </ul>
            <p>{{ $t('legal.hyperlinkingText4', { appName }) }}</p>
            <p>{{ $t('legal.hyperlinkingText5') }}</p>
            <p>{{ $t('legal.hyperlinkingText6', { appName }) }}</p>
            <p>{{ $t('legal.hyperlinkingText7') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.hyperlinkingMethod1') }}</li>
              <li>{{ $t('legal.hyperlinkingMethod2') }}</li>
              <li>{{ $t('legal.hyperlinkingMethod3') }}</li>
            </ul>
            <p>{{ $t('legal.hyperlinkingNoLogo', { appName }) }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.iframesTitle') }}</h2>
            <p>{{ $t('legal.iframesText') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.contentLiabilityTitle') }}</h2>
            <p>{{ $t('legal.contentLiabilityText') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.yourPrivacyTitle') }}</h2>
            <p>
              {{ $t('legal.yourPrivacyText') }}
              <NuxtLink :to="localePath('/privacy-policy')">{{ $t('legal.yourPrivacyLink') }}</NuxtLink>.
            </p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.reservationTitle') }}</h2>
            <p>{{ $t('legal.reservationText') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.removalTitle') }}</h2>
            <p>{{ $t('legal.removalText1') }}</p>
            <p>{{ $t('legal.removalText2') }}</p>

            <h2 class="text-headline-medium mt-6 mb-2">{{ $t('legal.disclaimerTitle') }}</h2>
            <p>{{ $t('legal.disclaimerText1') }}</p>
            <ul class="ml-4 mb-4">
              <li>{{ $t('legal.disclaimerItem1') }}</li>
              <li>{{ $t('legal.disclaimerItem2') }}</li>
              <li>{{ $t('legal.disclaimerItem3') }}</li>
              <li>{{ $t('legal.disclaimerItem4') }}</li>
            </ul>
            <p>{{ $t('legal.disclaimerText2') }}</p>
            <p>{{ $t('legal.disclaimerText3') }}</p>
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
