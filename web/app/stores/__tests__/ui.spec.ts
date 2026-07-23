import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { setDocMock, persistToLocalStorageMock } = vi.hoisted(() => ({
  setDocMock: vi.fn(),
  persistToLocalStorageMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => 'firestore'),
  doc: vi.fn(() => 'state-doc'),
  setDoc: setDocMock,
}))

const authStore = {
  isLoggedIn: true,
  user: { id: 'user-1' },
}

const listStore = {
  stateLoaded: true,
  persistToLocalStorage: persistToLocalStorageMock,
}

vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('useAuthStore', () => authStore)
vi.stubGlobal('useListStore', () => listStore)

const { useUIStore } = await import('../ui')

describe('UI store nav drawer persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockReset()
    persistToLocalStorageMock.mockReset()
    authStore.isLoggedIn = true
    listStore.stateLoaded = true
  })

  it('keeps mobile drawer changes local', async () => {
    const store = useUIStore()

    await store.setNavDrawer(true, false)

    expect(store.navDrawerOpen).toBe(true)
    expect(persistToLocalStorageMock).toHaveBeenCalledOnce()
    expect(setDocMock).not.toHaveBeenCalled()
  })

  it('persists desktop drawer changes to Firestore', async () => {
    const store = useUIStore()

    await store.setNavDrawer(true)

    expect(setDocMock).toHaveBeenCalledWith('state-doc', { navDrawerOpen: true }, { merge: true })
  })

  it('does not persist before list state is loaded', async () => {
    listStore.stateLoaded = false
    const store = useUIStore()

    await store.setNavDrawer(true)

    expect(store.navDrawerOpen).toBe(true)
    expect(persistToLocalStorageMock).toHaveBeenCalledOnce()
    expect(setDocMock).not.toHaveBeenCalled()
  })
})
