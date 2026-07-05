<template>
  <div>
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <PwaReloadPrompt />
  </div>
</template>
