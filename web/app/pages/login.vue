<script setup lang="ts">
import { mdiArrowLeft } from '@mdi/js'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'auth',
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
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="4" xl="3" class="mt-n16">
        <h3 class="text-display-medium text-center mb-4">{{ $t('auth.loginTitle') }}</h3>
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
