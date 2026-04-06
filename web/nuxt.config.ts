// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  ssr: true,

  features: {
    inlineStyles: false,
  },

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Hepilo',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://hepilo.com',
      siteEmail: process.env.NUXT_PUBLIC_SITE_EMAIL || 'arnold@hepilo.com',
      siteAndroidAppUrl: process.env.NUXT_PUBLIC_SITE_ANDROID_APP_URL || 'https://play.google.com/store/apps/details?id=com.hepilo.twa',
      githubLink: process.env.NUXT_PUBLIC_GITHUB_LINK || 'https://github.com/NdoleStudio/hepilo',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Le4-jseAAAAACQavdg0uBHEk6cIPnfQ-jRCYklA',
    },
  },

  css: ['~/assets/styles/global.scss'],

  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@sentry/nuxt',
    '@nuxt/fonts',
  ],

  fonts: {
    families: [
      {
        name: 'Manrope',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
      },
    ],
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
      },
      styles: {
        configFile: 'assets/styles/vuetify-settings.scss',
      },
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            colors: {
              primary: '#C6FF00',
            },
          },
          dark: {
            colors: {
              primary: '#C6FF00',
            },
          },
        },
      },
      icons: {
        defaultSet: 'mdi-svg',
      },
      defaults: {
        global: {
          font: {
            family: 'Manrope',
          },
        },
      },
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
      { code: 'fr', name: 'Français', language: 'fr-FR', file: 'fr.json' },
    ],
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    baseUrl: 'https://hepilo.com',
    lazy: true,
    compilation: {
      strictMessage: false,
    },
  },

  pwa: {
    manifest: {
      name: 'Hepilo - Shopping List',
      short_name: 'Hepilo',
      theme_color: '#C6FF00',
      background_color: '#C6FF00',
      id: 'com.hepilo.twa',
      orientation: 'portrait',
    },
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/privacy-policy': { prerender: true },
    '/terms-and-conditions': { prerender: true },
    '/login': { prerender: true },
    '/demo': { prerender: true },
    '/lists/**': { ssr: false },
    '/manage/**': { ssr: false },
    '/settings': { ssr: false },
  },
})
