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
        color="white"
        variant="outlined"
        :prepend-icon="mdiGoogle"
        :loading="loading"
        class="mb-4"
        @click="signInWithGoogle"
      >
        {{ t('auth.continueWithGoogle') }}
      </v-btn>

      <v-divider class="my-4" />

      <div v-if="!showEmailForm">
        <v-btn
          block
          size="large"
          variant="outlined"
          :prepend-icon="mdiEmail"
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
