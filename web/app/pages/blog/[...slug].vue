<script setup lang="ts">
import { useSeoDefaults } from '~/composables/useSeoDefaults'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const slug = computed(() => {
  const params = route.params.slug
  if (Array.isArray(params)) {
    return params.join('/')
  }
  return params
})

const { data: post } = await useAsyncData(`blog-${slug.value}`, () =>
  queryContent('/blog', slug.value)
    .findOne(),
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('blog.postNotFound'),
  })
}

useSeoDefaults({
  title: post.value?.title ?? t('blog.title'),
  description: post.value?.description ?? '',
  path: `/blog/${slug.value}`,
})
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
        <template v-if="post">
          <h1 class="text-display-small mb-4 mt-8">
            {{ post.title }}
          </h1>
          <p
            v-if="post.description"
            class="text-title-large text-medium-emphasis mb-8"
          >
            {{ post.description }}
          </p>

          <ContentRenderer :value="post" />

          <v-divider class="mt-8" color="primary" />
        </template>

        <div class="text-center mt-4">
          <BackButton :route="localePath('/blog')" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
