import { getFirestore, doc, setDoc } from 'firebase/firestore'
import type { AppData, SelectItem } from '~/types/state'

export const useSettingsStore = defineStore('settings', () => {
  const currency = ref(DEFAULT_CURRENCY)
  const showIntro = ref(true)

  const currencySymbol = computed((): string => {
    const symbol
      = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.value,
      })
        .formatToParts(0.0)
        .find(part => part.type === 'currency')?.value || '$'
    return symbol.replace('US$', '$').replace('CA$', 'CAD')
  })

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.value,
    })
      .format(value)
      .replace('US$', '$')
      .replace('CA$', 'CAD')
  }

  const currencySelectItems = computed((): SelectItem[] => {
    return [...CURRENCY_LIST]
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(c => ({
        text: c.description,
        value: c.code,
      }))
  })

  const appData = computed((): AppData => {
    const config = useRuntimeConfig()
    let url = (config.public.siteUrl as string) || ''
    if (url.length > 0 && url[url.length - 1] === '/') {
      url = url.substring(0, url.length - 1)
    }
    return {
      url,
      androidAppUrl: (config.public.siteAndroidAppUrl as string) || '',
      email: (config.public.siteEmail as string) || '',
      name: (config.public.appName as string) || 'Hepilo',
    }
  })

  async function setCurrency(newCurrency: string) {
    const uiStore = useUIStore()
    const authStore = useAuthStore()

    uiStore.setSaving(true)
    currency.value = newCurrency

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { currency: currency.value },
        { merge: true },
      )
    }

    uiStore.addNotification({
      type: 'success',
      message: 'Currency has been set successfully',
    })
    uiStore.setSaving(false)
  }

  async function setShowIntro(show: boolean) {
    const authStore = useAuthStore()
    showIntro.value = show

    const listStore = useListStore()
    listStore.persistToLocalStorage()

    if (authStore.isLoggedIn && authStore.user) {
      await setDoc(
        doc(getFirestore(), 'states', authStore.user.id),
        { showIntro: showIntro.value },
        { merge: true },
      )
    }
  }

  return {
    currency,
    showIntro,
    currencySymbol,
    formatCurrency,
    currencySelectItems,
    appData,
    setCurrency,
    setShowIntro,
  }
})
