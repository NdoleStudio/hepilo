<script setup lang="ts">
import { useSeoDefaults } from '~/composables/useSeoDefaults'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryContent('/blog')
    .sort({ date: -1 })
    .find(),
)

useSeoDefaults({
  title: t('blog.title'),
  description: t('home.heroSubtitle'),
  path: '/blog',
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        xl="6"
        md="8"
        offset-md="2"
        offset-xl="3"
      >
        <h1 class="text-display-small mb-6">
          {{ t('blog.title') }}
        </h1>

        <v-card
          v-for="post in posts"
          :key="post._path"
          class="mb-4 hover-opacity cursor-pointer"
          :to="localePath(post._path!)"
          hover
        >
          <v-card-title class="text-headline-large break-word">
            {{ post.title }}
          </v-card-title>
          <v-card-subtitle class="text-uppercase text-body-small">
            <span class="text-primary">{{ formatDate(post.date) }}</span>
            <span v-if="post.readMinutes"> • {{ post.readMinutes }} min read</span>
          </v-card-subtitle>
          <v-card-text>
            <p class="text-body-large">
              {{ post.description }}
            </p>
          </v-card-text>
        </v-card>

        <div class="text-center mt-4">
          <BackButton />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
