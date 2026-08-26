import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { setDocMock } = vi.hoisted(() => ({
  setDocMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => 'firestore'),
  doc: vi.fn(() => 'state-doc'),
  setDoc: setDocMock,
  onSnapshot: vi.fn(),
  getDoc: vi.fn(),
}))

vi.mock('~/plugins/sentry.client', () => ({
  captureSentryError: vi.fn(),
}))

const authStore = {
  isLoggedIn: true,
  user: { id: 'user-1' },
}
const itemStore = { items: [] }
const categoryStore = { categories: [] }
const settingsStore = { currency: 'USD', showIntro: false }
const uiStore = {
  loading: false,
  saving: false,
  title: '',
  notification: {},
  navDrawerOpen: true,
}

vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('useAuthStore', () => authStore)
vi.stubGlobal('useItemStore', () => itemStore)
vi.stubGlobal('useCategoryStore', () => categoryStore)
vi.stubGlobal('useSettingsStore', () => settingsStore)
vi.stubGlobal('useUIStore', () => uiStore)

const { useListStore } = await import('../list')

describe('List store Firestore persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockReset()
    localStorage.clear()
  })

  it('does not persist the nav drawer preference', async () => {
    const store = useListStore()

    await store.saveState()

    const payload = setDocMock.mock.calls[0]![1]
    expect(payload).not.toHaveProperty('navDrawerOpen')
  })
})
