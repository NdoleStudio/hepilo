<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

// Redirect already-signed-in users to their lists before the prerendered
// landing page paints, avoiding a ~1s flash of the marketing page on open.
// Runs synchronously in <head> before the body renders. The `guest`
// middleware still covers the case where the flag is absent but Firebase
// later resolves an authenticated user.
useHead({
  script: [
    {
      key: 'authed-redirect',
      tagPosition: 'head',
      innerHTML: `try{if(localStorage.getItem('${AUTHED_STORAGE_KEY}')==='1'){location.replace('/lists')}}catch(e){}`,
    },
  ],
})

const { t } = useI18n()
const localePath = useLocalePath()
const listStore = useListStore()

useSeoDefaults({
  title: t('home.heroTitle'),
  description: t('home.heroSeoDescription'),
  path: '/',
})

onMounted(async () => {
  await listStore.loadState()
  const list = listStore.selectedList
  if (list) {
    navigateTo(localePath(`/lists/${list.id}`))
  }
})
</script>

<template>
  <v-container>
    <v-progress-circular
      class="mx-auto d-block my-16"
      :size="100"
      :width="5"
      color="lime"
      indeterminate
    />
  </v-container>
</template>
