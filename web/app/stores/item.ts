import { getFirestore, doc, setDoc } from 'firebase/firestore'
import type { Item, ListItem, SelectItem, UpsertItemRequest } from '~/types/state'
import { CATEGORY_ID_UNCATEGORIZED, DEFAULT_CATEGORY } from './category'
import defaultCategoriesJson from '~/assets/categories.json'

const ITEM_UNITS = new Set<string>([
  'g',
  'kg',
  'l',
  'ml',
  'lbs',
  'oz',
  'cup',
  'bag',
  'gallon',
  'box',
  'bottle',
  'piece',
  'pack',
  'crate',
])

const PLURAL_ITEM_UNITS = new Map<string, string>([
  ['cup', 'cups'],
  ['bag', 'bags'],
  ['gallon', 'gallons'],
  ['box', 'boxes'],
  ['bottle', 'bottles'],
  ['piece', 'pieces'],
  ['pack', 'packs'],
  ['crate', 'crates'],
])

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])

  function nameToId(name: string): string {
    return name.trim().toLowerCase()
  }

  function toTitleCase(value: string): string {
    return value
      .split(' ')
      .map(w => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  function findItemById(id: string): Item | undefined {
    return items.value.find(item => item.id === id)
  }

  function itemByName(name: string): Item | undefined {
    return items.value.find(item => item.id === nameToId(name))
  }

  function hasItem(name: string): boolean {
    return itemByName(name) !== undefined
  }

  const autocompleteItems = computed((): SelectItem[] => {
    const listStore = useListStore()
    return items.value
      .filter((item: Item) => !listStore.listHasItemId(item.id))
      .map((item: Item) => ({
        value: item.name,
        text: item.name,
      }))
  })

  function itemListsCount(itemId: string): number {
    const listStore = useListStore()
    return listStore.lists.reduce((sum: number, list) => {
      return (
        sum
        + list.items.reduce((value: number, item: ListItem) => {
          if (item.itemId === itemId && value === 0) {
            return 1
          }
          return 0
        }, 0)
      )
    }, 0)
  }

  function findCategoryIdByItemId(itemId: string): string {
    const item = findItemById(itemId)
    if (item !== undefined) {
      return item.categoryId
    }
    return CATEGORY_ID_UNCATEGORIZED
  }

  function findCategoryNameByItemId(itemId: string): string {
    const categoryStore = useCategoryStore()
    const item = findItemById(itemId)
    if (item !== undefined) {
      return (
        categoryStore.findCategoryById(item.categoryId)?.name
        ?? DEFAULT_CATEGORY.name
      )
    }
    return DEFAULT_CATEGORY.name
  }

  function itemUnitName(unit: string, quantity: number | string): string {
    if (quantity === 1 || quantity === '1') {
      return unit
    }
    if (PLURAL_ITEM_UNITS.has(unit)) {
      return PLURAL_ITEM_UNITS.get(unit)!
    }
    return unit
  }

  const itemUnitSelectItems = computed((): SelectItem[] => {
    return Array.from(ITEM_UNITS)
      .sort()
      .map(unit => ({
        text: unit,
        value: unit,
      }))
  })

  function isValidUnit(unit: string | null): boolean {
    return ITEM_UNITS.has(unit ?? '')
  }

  async function upsertItem(request: UpsertItemRequest) {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const listStore = useListStore()

    uiStore.setSaving(true)

    let item = findItemById(request.itemId)
    if (!item) {
      item = {
        id: nameToId(request.name),
        name: request.name.trim(),
        unit: null,
        pricePerUnit: 0,
        categoryId: CATEGORY_ID_UNCATEGORIZED,
      }
    }

    item.unit = isValidUnit(request.unit) ? request.unit : null
    item.name = request.name.trim()
    item.pricePerUnit = request.pricePerUnit
    item.categoryId = request.categoryId

    // Upsert into items array
    const index = items.value.findIndex(i => i.id === item!.id)
    if (index === -1) {
      items.value.push(item)
    }
    else {
      items.value[index] = item
    }
    items.value = [...items.value]

    // Update ID if name changed
    const newId = nameToId(request.name)
    if (newId !== item.id) {
      const oldId = request.itemId
      // Update item ID in items array
      items.value = items.value.map((i: Item) => {
        if (i.id === oldId) i.id = newId
        return i
      })

      // Update references in all lists
      listStore.lists = listStore.lists.map((list) => {
        list.items = list.items.map((listItem: ListItem) => {
          if (listItem.itemId === oldId) listItem.itemId = newId
          return listItem
        })
        return list
      })
    }

    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      const categoryStore = useCategoryStore()
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        {
          lists: listStore.lists,
          categories: categoryStore.categories,
          items: items.value,
        },
        { merge: true },
      )
    }

    uiStore.setSaving(false)
  }

  async function deleteItem(itemId: string) {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const listStore = useListStore()
    const categoryStore = useCategoryStore()

    uiStore.setSaving(true)

    const item = findItemById(itemId)

    items.value = items.value.filter(i => i.id !== itemId)
    listStore.lists = listStore.lists.map((list) => {
      list.items = list.items.filter((li: ListItem) => li.itemId !== itemId)
      return list
    })

    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { categories: categoryStore.categories, items: items.value },
        { merge: true },
      )
    }

    uiStore.addNotification({
      type: 'info',
      message: `${item?.name ?? 'Item'} has been deleted successfully`,
    })
    uiStore.setSaving(false)
  }

  async function syncItems() {
    const authStore = useAuthStore()
    const categoryStore = useCategoryStore()

    let allItems = [...items.value]
    Object.entries(defaultCategoriesJson).forEach(([key, value]) => {
      const category = categoryStore.findCategoryById(nameToId(key))
      value.forEach((itemName: string) => {
        if (!findItemById(nameToId(itemName))) {
          allItems.push({
            unit: null,
            categoryId: category ? category.id : CATEGORY_ID_UNCATEGORIZED,
            id: nameToId(itemName),
            name: toTitleCase(itemName),
            pricePerUnit: 0,
          })
        }
        else {
          allItems = allItems.map((arrayItem: Item) => {
            if (
              nameToId(itemName) === arrayItem.id
              && arrayItem.categoryId === CATEGORY_ID_UNCATEGORIZED
              && category
            ) {
              arrayItem.categoryId = category.id
            }
            return arrayItem
          })
        }
      })
    })

    // Deduplicate
    const keys = new Set<string>()
    allItems = allItems.filter((item: Item) => {
      if (keys.has(item.id)) return false
      keys.add(item.id)
      return true
    })

    items.value = allItems

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { items: items.value },
        { merge: true },
      )
    }
  }

  return {
    items,
    findItemById,
    itemByName,
    hasItem,
    autocompleteItems,
    itemListsCount,
    findCategoryIdByItemId,
    findCategoryNameByItemId,
    nameToId,
    toTitleCase,
    itemUnitName,
    itemUnitSelectItems,
    isValidUnit,
    upsertItem,
    deleteItem,
    syncItems,
  }
})
