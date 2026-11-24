<script setup lang="ts">
import { mdiTranslate } from '@mdi/js'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => locales.value.filter((l) => typeof l !== 'string'))

const currentLocaleName = computed(() => {
  const current = availableLocales.value.find((l) => l.code === locale.value)
  return current?.name ?? locale.value
})
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" :prepend-icon="mdiTranslate">
        {{ currentLocaleName }}
      </v-btn>
    </template>
    <v-list class="py-0">
      <v-list-item
        v-for="loc in availableLocales"
        :key="loc.code"
        class="mr-0 ml-0 pl-8"
        :to="switchLocalePath(loc.code)"
        :active="loc.code === locale"
      >
        <v-list-item-title>{{ loc.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
