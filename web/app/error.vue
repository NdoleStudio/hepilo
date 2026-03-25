<script setup lang="ts">
import { mdiHome } from '@mdi/js'
import notFoundSvg from '~/assets/images/not-found.svg'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: t('notFound.title'),
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="px-5" offset-md="3" offset-lg="3" md="6" lg="6">
        <v-card>
          <v-card-title>
            <div class="mx-auto text-center text-break">
              {{ $t('notFound.title') }}
            </div>
          </v-card-title>
          <v-card-text>
            <v-img
              contain
              class="mx-auto"
              max-width="500"
              max-height="500"
              :src="notFoundSvg"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="lime-darken-4"
              size="large"
              exact
              :to="localePath('/')"
              class="font-weight-bold mx-auto mb-4"
            >
              {{ $t('notFound.takeMeHome') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
