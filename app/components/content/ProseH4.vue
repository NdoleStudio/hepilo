<template>
  <h4 :id="id" class="text-title-large mt-6 mb-2">
    <slot />
  </h4>
</template>

<script setup lang="ts">
defineProps<{ id?: string }>()
</script>
