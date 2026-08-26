<script setup lang="ts">
import Typewriter from 'typewriter-effect/dist/core'

definePageMeta({
  layout: 'auth'
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

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

useSeoDefaults({
  title: t('home.heroTitle'),
  description: t('home.heroSeoDescription'),
  path: '/',
})

const typewriterEl = ref<HTMLElement | null>(null)
let typewriter: Typewriter | null = null

onMounted(() => {
  if (!typewriterEl.value) return

  const raw: unknown = tm('home.typewriterStrings')
  const strings = Array.isArray(raw) ? raw.map((s) => rt(s as Parameters<typeof rt>[0])) : []

  // Clear the SSR/prerendered fallback text so Typewriter fully controls
  // the element instead of typing on top of the existing content.
  typewriterEl.value.textContent = ''

  typewriter = new Typewriter(typewriterEl.value, {
    strings,
    autoStart: true,
    loop: true,
  })
})

onBeforeUnmount(() => {
  typewriter?.stop()
  typewriter = null
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-responsive max-width="1264" class="mx-auto">
      <v-btn size="large" color="secondary" class="mt-4 mb-4 ml-4" :to="localePath('/demo')">
        {{ t('home.liveDemo') }}
      </v-btn>
    </v-responsive>
  </div>
</template>
