import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const homepage = readFileSync(resolve('app', 'pages', 'index.vue'), 'utf8')
const scriptExpression = homepage.match(/innerHTML:\s*(`[^`]+`)/)?.[1]
if (!scriptExpression) throw new Error('Homepage redirect script not found')

const config = {
  public: {
    i18n: { defaultLocale: 'en', detectBrowserLanguage: { cookieKey: 'i18n_redirected' } },
  },
}
const localePaths = {
  en: '/lists',
  fr: '/fr/lists',
  es: '/es/lists',
  de: '/de/lists',
  et: '/et/lists',
}
const script = new Function(
  'AUTHED_STORAGE_KEY',
  'localePaths',
  'config',
  `return ${scriptExpression}`,
)('hepilo-authed', localePaths, config)

function runRedirect(cookie: string, pathname = '/', signedIn = true) {
  const location = { pathname, replace: vi.fn() }
  new Function('localStorage', 'document', 'location', script)(
    { getItem: () => (signedIn ? '1' : null) },
    { cookie },
    location,
  )
  return location.replace
}

describe('prerendered homepage redirect', () => {
  it.each([
    ['i18n_redirected=fr', '/fr/lists'],
    ['other=value; i18n_redirected=es', '/es/lists'],
    ['i18n_redirected=de', '/de/lists'],
    ['i18n_redirected=et', '/et/lists'],
    ['i18n_redirected=en', '/lists'],
    ['', '/lists'],
    ['i18n_redirected=unknown', '/lists'],
  ])('preserves the saved language for cookie %s', (cookie, destination) => {
    expect(runRedirect(cookie)).toHaveBeenCalledWith(destination)
  })

  it('keeps an explicitly localized homepage ahead of the saved language', () => {
    expect(runRedirect('i18n_redirected=de', '/fr')).toHaveBeenCalledWith('/fr/lists')
  })

  it('keeps an explicitly Estonian homepage ahead of the saved language', () => {
    expect(runRedirect('i18n_redirected=en', '/et')).toHaveBeenCalledWith('/et/lists')
  })

  it('does not redirect signed-out visitors', () => {
    expect(runRedirect('i18n_redirected=fr', '/', false)).not.toHaveBeenCalled()
  })
})
