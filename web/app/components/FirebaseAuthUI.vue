<script setup lang="ts">
// Custom Firebase Auth UI using Vuetify 4 components
// Replaces firebaseui which doesn't support Vue 3

import { ref } from 'vue'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { mdiGoogle, mdiEmail } from '@mdi/js'

const emit = defineEmits<{
  success: []
  error: [error: Error]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showEmailForm = ref(false)

async function signInWithGoogle() {
  loading.value = true
  errorMessage.value = ''
  try {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    emit('success')
  } catch (error: any) {
    errorMessage.value = error.message
    emit('error', error)
  } finally {
    loading.value = false
  }
}

async function handleEmailAuth() {
  loading.value = true
  errorMessage.value = ''
  try {
    const auth = getAuth()
    if (isSignUp.value) {
      await createUserWithEmailAndPassword(auth, email.value, password.value)
    } else {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    }
    emit('success')
  } catch (error: any) {
    errorMessage.value = error.message
    emit('error', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card max-width="400" class="mx-auto" flat>
    <v-card-text>
      <v-btn
        block
        size="large"
        color="#f5f5f5"
        variant="flat"
        :loading="loading"
        class="mb-4 text-none"
        @click="signInWithGoogle"
      >
        <template #prepend>
          <v-icon :icon="mdiGoogle" color="#b65b46" />
        </template>
        {{ t('auth.continueWithGoogle') }}
      </v-btn>
      <div v-if="!showEmailForm">
        <v-btn
          block
          size="large"
          color="#c0513f"
          variant="flat"
          :prepend-icon="mdiEmail"
          class="text-none text-white"
          @click="showEmailForm = true"
        >
          {{ t('auth.continueWithEmail') }}
        </v-btn>
      </div>

      <v-form v-else @submit.prevent="handleEmailAuth">
        <v-text-field
          v-model="email"
          :label="t('auth.email')"
          type="email"
          required
          class="mb-2"
        />
        <v-text-field
          v-model="password"
          :label="t('auth.password')"
          type="password"
          required
          class="mb-2"
        />
        <v-btn
          block
          size="large"
          color="primary"
          type="submit"
          :loading="loading"
          class="text-none"
        >
          {{ isSignUp ? t('auth.signUp') : t('auth.signIn') }}
        </v-btn>
        <v-btn
          block
          variant="text"
          size="small"
          class="mt-2"
          @click="isSignUp = !isSignUp"
        >
          {{ isSignUp ? t('auth.haveAccount') : t('auth.noAccount') }}
        </v-btn>
      </v-form>

      <i18n-t keypath="auth.byContinuing" tag="p" class="text-body-small text-medium-emphasis text-center mt-4">
        <template #termsOfService>
          <NuxtLinkLocale class="text-primary text-decoration-none hover:text-decoration-underline" to="/terms-and-conditions">{{ t('auth.termsOfService') }}</NuxtLinkLocale>
        </template>
        <template #privacyPolicy>
          <NuxtLinkLocale class="text-primary text-decoration-none hover:text-decoration-underline" to="/privacy-policy">{{ t('auth.privacyPolicy') }}</NuxtLinkLocale>
        </template>
      </i18n-t>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mt-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>
