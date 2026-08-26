<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mdiLogin } from '@mdi/js'
import { onAuthStateChanged } from 'firebase/auth'

const { t } = useI18n()
const localePath = useLocalePath()
const { isInStandaloneMode } = useUtils()
const { getFirebaseAuth } = useFirebase()

const isLoggedIn = ref(false)
const isStandalone = ref(false)
const platformName = computed(() =>
  isStandalone.value ? t('demo.platformApp') : t('demo.platformWebsite'),
)

onMounted(() => {
  isStandalone.value = isInStandaloneMode()
  onAuthStateChanged(getFirebaseAuth(), (user) => {
    isLoggedIn.value = !!user
  })
})
</script>

<template>
  <v-alert v-if="!isLoggedIn" class="mb-4" variant="tonal" color="info">
    <v-row>
      <div class="d-flex align-center">
        <div class="flex-grow-1">
          {{ t('demo.bannerText', { platform: platformName }) }}
          <NuxtLink class="text-decoration-none" :to="localePath('/login')">
            {{ t('demo.bannerLoginLink') }}
          </NuxtLink>
        </div>
        <div class="flex-shrink-1 d-none d-md-flex">
          <v-btn color="secondary" class="mx-4" :to="localePath('/login')">
            <v-icon :icon="mdiLogin" size="small" class="mr-2" />
            {{ t('demo.loginButton') }}
          </v-btn>
        </div>
      </div>
    </v-row>
  </v-alert>
</template>
