import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCatalogNames } from '../../composables/useCatalogNames'
import fr from '../../../i18n/locales/catalog-fr.json'
import et from '../../../i18n/locales/catalog-et.json'

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

const { LIST_ICON_DEFAULT, useListStore } = await import('../list')
const { useItemStore } = await import('../item')
const { useCategoryStore } = await import('../category')

function shoppingList(id: string) {
  return { id, name: id, icon: LIST_ICON_DEFAULT, items: [], cartPanelOpen: true }
}

describe('List store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockReset()
    localStorage.clear()
    vi.stubGlobal('useNuxtApp', () => ({ $i18n: {} }))
    vi.stubGlobal('useAuthStore', () => authStore)
    vi.stubGlobal('useItemStore', () => itemStore)
    vi.stubGlobal('useCategoryStore', () => categoryStore)
    vi.stubGlobal('useSettingsStore', () => settingsStore)
    vi.stubGlobal('useUIStore', () => uiStore)
  })

  it('switches seeded labels without renaming stored entries or custom names', async () => {
    const locale = ref<'fr' | 'et'>('fr')
    function lookup(key: string) {
      const [, group, id] = key.split('.')
      const messages: Record<string, Record<string, string>> = { fr, et }[locale.value].catalog
      return messages[group!]?.[id!]
    }
    vi.stubGlobal('useNuxtApp', () => ({ $i18n: { locale, te: lookup, t: lookup } }))
    vi.stubGlobal('useItemStore', useItemStore)
    vi.stubGlobal('useCategoryStore', useCategoryStore)
    vi.stubGlobal('useListStore', useListStore)
    vi.stubGlobal('useCatalogNames', useCatalogNames)
    vi.stubGlobal('useAuthStore', () => ({ isLoggedIn: false, user: null }))
    vi.stubGlobal('useUIStore', () => ({ setSaving: vi.fn(), addNotification: vi.fn() }))
    const lists = useListStore()
    const items = useItemStore()
    const categories = useCategoryStore()
    lists.selectedListId = 'weekly'
    lists.lists = [{ id: 'weekly', name: 'My list', icon: 'list', items: [], cartPanelOpen: false }]
    lists.setDefaultItems()

    expect(items.autocompleteItems).toContainEqual({ title: 'Lait', value: 'Milk', unit: null })
    await lists.addItem('2 Lait')
    const dairy = lists.listMaterializedItems[0]!
    expect(dairy.category.name).toBe('Produits laitiers')
    expect(dairy.items[0]!.item.name).toBe('Lait')
    await lists.updateItem({
      itemId: 'milk',
      name: 'Lait',
      categoryId: 'dairy',
      quantity: 3,
      notes: 'My usual brand',
      unit: 'l',
      pricePerUnit: 2,
      addedToCart: true,
    })
    await categories.upsertCategory({ id: 'dairy', name: 'Produits laitiers', color: 'blue' })
    expect(items.findItemById('milk')?.name).toBe('Milk')
    expect(categories.findCategoryById('dairy')?.name).toBe('Dairy')

    locale.value = 'et'
    const cart = lists.cartMaterializedItems[0]!
    expect(cart.category.name).toBe('Piimatooted')
    expect(cart.items[0]!.item.name).toBe('Piim')
    expect(cart.items[0]!.listItem).toMatchObject({
      itemId: 'milk',
      quantity: 3,
      notes: 'My usual brand',
    })
    await items.upsertItem({
      itemId: 'milk',
      name: 'Farm milk',
      unit: 'l',
      pricePerUnit: 2,
      categoryId: 'dairy',
    })
    locale.value = 'fr'
    expect(lists.cartMaterializedItems[0]!.items[0]!.item.name).toBe('Farm milk')
    await items.deleteItem('farm milk')
    await lists.addItem('Milk')
    expect(lists.listMaterializedItems[0]!.items[0]!.item.name).toBe('Milk')
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
