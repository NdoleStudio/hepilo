<script setup lang="ts">
import { ref } from 'vue'
import { mdiClose } from '@mdi/js'

defineProps<{
  href: string
}>()

const { t } = useI18n()

const snackbarShow = ref(true)

function onClose() {
  snackbarShow.value = false
}
</script>

<template>
  <v-snackbar
    v-model="snackbarShow"
    :timeout="-1"
    location="bottom"
    multi-line
    class="mb-10"
  >
    <div class="d-flex align-start">
      <div class="flex-grow-1">
        <slot />
      </div>
      <v-btn
        icon
        size="x-small"
        variant="text"
        class="ml-2"
        @click="onClose"
      >
        <v-icon :icon="mdiClose" />
      </v-btn>
    </div>

    <template #actions>
      <v-btn
        color="primary"
        size="small"
        :href="href"
      >
        {{ t('common.get') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>
