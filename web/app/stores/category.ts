import { getFirestore, doc, setDoc } from 'firebase/firestore'
import type { Category, Item, SelectItem, UpsertCategoryRequest } from '~/types/state'
import defaultCategoriesJson from '~/assets/categories.json'

export const CATEGORY_ID_UNCATEGORIZED = 'uncategorized'
export const CATEGORY_COLOR_TEAL = 'teal'

const CATEGORY_COLORS = new Set<string>([
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'blue-grey',
  'teal',
])

export const DEFAULT_CATEGORY: Category = {
  id: CATEGORY_ID_UNCATEGORIZED,
  name: 'Uncategorized',
  color: 'teal',
}

export const useCategoryStore = defineStore('category', () => {
  const { $i18n } = useNuxtApp()
  const { displayName, storedName } = useCatalogNames('categories')
  const categories = ref<Category[]>([{ ...DEFAULT_CATEGORY }])

  const editableCategories = computed(() =>
    categories.value
      .filter((c) => c.id !== CATEGORY_ID_UNCATEGORIZED)
      .map((c) => ({ ...c, name: displayName(c) })),
  )

  function findCategoryById(categoryId: string): Category | undefined {
    return categories.value.find((c) => c.id === categoryId)
  }

  function findCategoryByName(categoryName: string): Category | undefined {
    return categories.value.find((c) => c.id === categoryName.trim().toLowerCase())
  }

  function categoryItemsCount(categoryId: string): number {
    const itemStore = useItemStore()
    return itemStore.items.reduce((sum: number, item: Item) => {
      return item.categoryId === categoryId ? sum + 1 : sum
    }, 0)
  }

  const categorySelectItems = computed((): SelectItem[] =>
    categories.value.map((c) => ({ value: c.id, title: displayName(c) })),
  )

  const categoryColorSelectItems = computed((): SelectItem[] =>
    Array.from(CATEGORY_COLORS)
      .sort()
      .map((color) => ({
        value: color,
        title: color
          .split('-')
          .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase())
          .join(' '),
      })),
  )

  async function upsertCategory(request: UpsertCategoryRequest) {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const itemStore = useItemStore()

    uiStore.setSaving(true)

    let category = findCategoryById(request.id)
    const name = storedName(category, request.name)
    const nameId = name.toLowerCase()
    let isNew = false
    if (!category) {
      isNew = true
      category = {
        name,
        customName: true,
        id: nameId,
        color: request.color,
      }
    }

    if (category.name !== name) category.customName = true
    category.name = name
    category.color = request.color

    // Upsert into categories array
    const index = categories.value.findIndex((c) => c.id === category!.id)
    if (index === -1) {
      categories.value.push(category)
    } else {
      categories.value[index] = category
    }
    categories.value = [...categories.value]

    // Update ID if name changed on an existing category
    const categoryIsUpdated = !isNew && nameId !== category.id
    if (categoryIsUpdated) {
      const oldId = request.id
      categories.value = categories.value.map((c) => {
        if (c.id === oldId) c.id = nameId
        return c
      })
      itemStore.items = itemStore.items.map((item: Item) => {
        if (item.categoryId === oldId) item.categoryId = nameId
        return item
      })
    }

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { categories: categories.value, items: itemStore.items },
        { merge: true },
      )
    }

    uiStore.addNotification({
      type: 'success',
      message: $i18n.t(isNew ? 'notification.categoryAdded' : 'notification.categoryUpdated'),
    })
    uiStore.setSaving(false)
  }

  async function deleteCategory(categoryId: string) {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const itemStore = useItemStore()

    uiStore.setSaving(true)

    categories.value = categories.value.filter((c) => c.id !== categoryId)
    itemStore.items = itemStore.items.map((item: Item) => {
      if (item.categoryId === categoryId) item.categoryId = CATEGORY_ID_UNCATEGORIZED
      return item
    })

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { categories: categories.value, items: itemStore.items },
        { merge: true },
      )
    }

    uiStore.addNotification({
      type: 'info',
      message: $i18n.t('notification.categoryDeleted'),
    })
    uiStore.setSaving(false)
  }

  async function syncCategories() {
    const authStore = useAuthStore()
    const colors = Array.from(CATEGORY_COLORS)

    Object.entries(defaultCategoriesJson).forEach(([key], index) => {
      const id = key.trim().toLowerCase()
      if (!findCategoryById(id)) {
        categories.value.push({
          color: colors[index] || 'teal',
          id,
          name: key,
        })
      }
    })

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { categories: categories.value },
        { merge: true },
      )
    }
  }

  return {
    categories,
    displayName,
    editableCategories,
    findCategoryById,
    findCategoryByName,
    categoryItemsCount,
    categorySelectItems,
    categoryColorSelectItems,
    upsertCategory,
    deleteCategory,
    syncCategories,
  }
})
