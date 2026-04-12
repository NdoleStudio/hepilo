<template>
  <h2 :id="id" class="text-headline-large mt-8 mb-3">
    <slot />
  </h2>
</template>

<script setup lang="ts">
defineProps<{ id?: string }>()
</script>
