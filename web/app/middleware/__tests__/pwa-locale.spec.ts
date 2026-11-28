import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const configSource = readFileSync(resolve('nuxt.config.ts'), 'utf8')
const configExpression = configSource.match(/export default ([\s\S]+)/)?.[1]
if (!configExpression) throw new Error('Nuxt configuration not found')
const config = new Function('defineNuxtConfig', `return ${configExpression}`)(
  (config: unknown) => config,
)

const projectRequire = createRequire(import.meta.url)
const i18nEntry = projectRequire.resolve('@nuxtjs/i18n')
const i18nRequire = createRequire(i18nEntry)
const { parsePath } = i18nRequire('ufo')
const { isString } = i18nRequire('@intlify/shared')
const detectionSource = readFileSync(
  resolve(dirname(i18nEntry), 'runtime', 'shared', 'detection.js'),
  'utf8',
)
// Run the installed detector without importing its Nuxt-only virtual modules.
const createLocaleDetector = new Function(
  'parsePath',
  'isString',
  `return ${detectionSource.slice(detectionSource.indexOf('export function createLocaleDetector')).replace(/^export /, '')}`,
)(parsePath, isString)

const localeCodes: string[] = config.i18n.locales.map((locale: { code: string }) => locale.code)
const detectLocale = createLocaleDetector({
  detection: { ...config.i18n.detectBrowserLanguage, enabled: true },
  routing: true,
  domains: false,
  isSupportedLocale: (locale: string) => localeCodes.includes(locale),
})

function detectOnLaunch(cookie: string, path = config.pwa.manifest.start_url, initial = true) {
  return detectLocale(
    {
      cookie: () => cookie,
      header: () => undefined,
      navigator: () => 'en',
      route: (route: string | { path: string; name: string }) =>
        typeof route === 'string' ? route.split('/')[1] : route.name.split('___')[1],
    },
    {
      path,
      name: `lists___${localeCodes.includes(path.split('/')[1]) ? path.split('/')[1] : 'en'}`,
    },
    initial,
  )
}

describe('PWA launch language detection', () => {
  it.each(['fr', 'es', 'de', 'et'])('restores saved %s at the manifest start URL', (locale) => {
    expect(detectOnLaunch(locale)).toBe(locale)
  })

  it('keeps an explicitly localized launch URL ahead of the cookie', () => {
    expect(detectOnLaunch('de', '/fr/lists')).toBe('fr')
  })

  it.each(['', 'unknown', 'en'])('uses English with cookie %s', (cookie) => {
    expect(detectOnLaunch(cookie)).toBe('en')
  })

  it('allows switching back to English after startup', () => {
    expect(detectOnLaunch('fr', '/lists', false)).toBe('en')
  })
})
