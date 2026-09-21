import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: 'https://1e5300c5ad8449968a2edbd2fb25e255@o291224.ingest.us.sentry.io/6244114',

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()],
  enableLogs: true,
  debug: false,
})
