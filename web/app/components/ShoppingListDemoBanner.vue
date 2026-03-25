<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mdiLogin } from '@mdi/js'
import { onAuthStateChanged } from 'firebase/auth'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { getFirebaseAuth } = useFirebase()

const isLoggedIn = ref(false)
const platformName = computed(() => config.public.appName as string)

onMounted(() => {
  onAuthStateChanged(getFirebaseAuth(), (user) => {
    isLoggedIn.value = !!user
  })
})
</script>

<template>
  <v-alert
    v-if="!isLoggedIn"
    type="info"
    variant="tonal"
    color="info"
  >
    <v-row align="center">
      <v-col class="flex-grow-1">
        {{ t('demo.bannerText', { platform: platformName }) }}
        <NuxtLink :to="localePath('/login')">
          {{ t('demo.bannerLoginLink') }}
        </NuxtLink>
      </v-col>
      <v-col class="flex-shrink-0 d-none d-md-flex">
        <v-btn :to="localePath('/login')">
          <v-icon :icon="mdiLogin" size="small" class="mr-2" />
          {{ t('demo.loginButton') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>
