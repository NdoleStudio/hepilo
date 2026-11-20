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

const { LIST_ICON_DEFAULT, useListStore } = await import('../list')

function shoppingList(id: string) {
  return { id, name: id, icon: LIST_ICON_DEFAULT, items: [], cartPanelOpen: true }
}

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

  it('saves the dropped order without changing the selected list', async () => {
    const store = useListStore()
    const [first, second, third] = ['first', 'second', 'third'].map(shoppingList)
    store.lists = [first!, second!, third!]
    store.selectedListId = 'second'

    await store.reorderLists(['third', 'first', 'second'])

    const lists = [third, first, second]
    expect(store.lists).toEqual(lists)
    expect(store.selectedListId).toBe('second')
    expect(setDocMock).toHaveBeenCalledExactlyOnceWith('state-doc', { lists }, { merge: true })
  })

  it('ignores a no-op drop and rejects an order with missing or duplicate lists', async () => {
    const store = useListStore()
    store.lists = ['first', 'second'].map(shoppingList)

    await store.reorderLists(['first', 'second'])
    await expect(store.reorderLists(['first'])).rejects.toThrow('list IDs have changed')
    await expect(store.reorderLists(['first', 'first'])).rejects.toThrow('list IDs have changed')

    expect(store.lists.map(({ id }) => id)).toEqual(['first', 'second'])
    expect(setDocMock).not.toHaveBeenCalled()
  })

  it('restores the previous order when the save fails', async () => {
    const store = useListStore()
    store.lists = ['first', 'second'].map(shoppingList)
    setDocMock.mockRejectedValueOnce(new Error('permission denied'))

    await expect(store.reorderLists(['second', 'first'])).rejects.toThrow('permission denied')

    expect(store.lists.map(({ id }) => id)).toEqual(['first', 'second'])
  })
})
