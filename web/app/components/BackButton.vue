<script setup lang="ts">
import { mdiArrowLeft } from '@mdi/js'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  route?: RouteLocationRaw
  block?: boolean
}>()

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

function goBack() {
  if (props.route) {
    navigateTo(props.route)
    return
  }
  if (window.history.length > 1) {
    router.back()
    return
  }
  navigateTo(localePath('/'))
}
</script>

<template>
  <v-btn
    variant="flat"
    :block="block"
    :class="{ 'w-full': block }"
    @click="goBack"
  >
    <v-icon :icon="mdiArrowLeft" start />
    {{ t('common.goBack') }}
  </v-btn>
</template>
