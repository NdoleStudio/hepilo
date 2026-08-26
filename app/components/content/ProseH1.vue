<template>
  <h1 :id="id" class="text-display-small mb-4">
    <slot />
  </h1>
</template>

<script setup lang="ts">
defineProps<{ id?: string }>()
</script>
