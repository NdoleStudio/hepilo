import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineNuxtRouteMiddleware', (middleware: unknown) => middleware)

const getCurrentUser = vi.fn()
const navigateTo = vi.fn((path: string) => path)
let locale = 'fr'
vi.stubGlobal('useFirebase', () => ({ getCurrentUser }))
vi.stubGlobal('navigateTo', navigateTo)
vi.stubGlobal('useLocalePath', () => (path: string) => `/${locale}${path}`)

const guest = (await import('../guest')).default
const auth = (await import('../auth')).default
const demoOrAuth = (await import('../demo-or-auth')).default

describe.each(['fr', 'et'])('%s authentication redirects', (selectedLocale) => {
  beforeEach(() => {
    locale = selectedLocale
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('sends signed-in guests to localized lists', async () => {
    getCurrentUser.mockResolvedValue({ uid: 'user' })
    expect(await guest({} as never, {} as never)).toBe(`/${selectedLocale}/lists`)
  })

  it.each([
    ['auth', auth],
    ['demo-or-auth', demoOrAuth],
  ])('sends signed-out visitors to localized login in %s', async (_name, middleware) => {
    getCurrentUser.mockResolvedValue(null)
    expect(await middleware({} as never, {} as never)).toBe(`/${selectedLocale}/login`)
  })
})
