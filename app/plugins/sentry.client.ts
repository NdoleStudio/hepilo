export default defineNuxtPlugin(() => {
  // Sentry is configured via @sentry/nuxt module in nuxt.config.ts
})

export function captureSentryError(error: Error): void {
  if (import.meta.client) {
    import('@sentry/nuxt').then((Sentry) => {
      Sentry.captureException(error)
    })
  }
}

export function captureSentryMessage(message: string): void {
  if (import.meta.client) {
    import('@sentry/nuxt').then((Sentry) => {
      Sentry.captureMessage(message)
    })
  }
}
