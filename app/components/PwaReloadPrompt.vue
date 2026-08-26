<script setup lang="ts">
import { computed } from 'vue'
import { mdiClose } from '@mdi/js'

const { t } = useI18n()
const { $pwa } = useNuxtApp()

const show = computed(() => Boolean($pwa?.needRefresh || $pwa?.offlineReady))

async function reload() {
  if (import.meta.client && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    })
  }

  await $pwa?.updateServiceWorker(true)

  if (import.meta.client) {
    window.setTimeout(() => window.location.reload(), 2000)
  }
}

function close() {
  if ($pwa) {
    $pwa.needRefresh = false
    $pwa.offlineReady = false
  }
}
</script>

<template>
  <v-snackbar
    v-if="$pwa"
    :model-value="show"
    :timeout="-1"
    location="bottom"
    variant="tonal"
    color="primary"
    multi-line
  >
    <span>{{ $pwa.needRefresh ? t('pwa.newContent') : t('pwa.offlineReady') }}</span>

    <template #actions>
      <v-btn v-if="$pwa.needRefresh" color="primary" variant="flat" size="small" @click="reload">
        {{ t('pwa.reload') }}
      </v-btn>
      <v-btn icon size="x-small" variant="text" class="ml-2" @click="close">
        <v-icon :icon="mdiClose" />
      </v-btn>
    </template>
  </v-snackbar>
</template>
