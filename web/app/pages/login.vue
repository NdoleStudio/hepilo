<script setup lang="ts">
import { useSeoDefaults } from '~/composables/useSeoDefaults'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'auth',
})

useSeoDefaults({
  title: t('auth.loginSeoTitle'),
  description: t('auth.loginSeoDescription'),
  path: '/login',
})

const loading = ref(true)

function onAuthSuccess() {
  navigateTo(localePath('/lists'))
}

function onAuthError(error: Error) {
  console.error('Auth error:', error)
}

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <v-container class="d-flex align-center justify-center" fluid style="min-height: calc(100dvh - 320px)">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <h3 class="text-display-medium text-center mb-2 mt-n16">{{ $t('auth.loginTitle') }}</h3>
        <p class="text-body-large text-medium-emphasis text-center mb-6">
          {{ $t('auth.loginSubtitle') }}
        </p>
        <FirebaseAuthUI
          @success="onAuthSuccess"
          @error="onAuthError"
        />
        <div class="text-center mt-4">
          <BackButton />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
