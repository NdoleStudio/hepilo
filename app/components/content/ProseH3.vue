<template>
  <h3 :id="id" class="text-headline-small mt-6 mb-2">
    <slot />
  </h3>
</template>

<script setup lang="ts">
defineProps<{ id?: string }>()
</script>
