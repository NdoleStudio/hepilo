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
  queryCollection('blog')
    .path(`/blog/${slug.value}`)
    .first(),
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
        md="8"
        offset-md="2"
        xl="8"
        offset-xl="2"
        xxl="6"
        offset-xxl="3"
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

          <div class="blog-content">
            <ContentRenderer :value="post" />
          </div>
        </template>
        <div class="px-16">
          <v-divider class="mt-8" color="primary" />
        </div>
        <div class="text-center mt-4">
          <BackButton :route="localePath('/blog')" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.blog-content :deep(a) {
  text-decoration: none;
}

.blog-content :deep(a:hover) {
  text-decoration: underline;
}

.blog-content :deep(img) {
  display: block;
  margin-inline: auto;
}
</style>
