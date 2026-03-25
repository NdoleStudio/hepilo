<script setup lang="ts">
const localePath = useLocalePath()
const listStore = useListStore()

definePageMeta({
  layout: 'default',
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
