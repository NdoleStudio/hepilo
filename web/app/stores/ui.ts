import { getFirestore, doc, setDoc } from 'firebase/firestore'
import type { Notification, NotificationRequest } from '~/types/state'

const DEFAULT_NOTIFICATION_TIMEOUT = 3000

export const useUIStore = defineStore('ui', () => {
  const loading = ref(false)
  const saving = ref(false)
  const title = ref('')
  const notification = ref<Notification>({
    active: false,
    message: '',
    type: 'success',
    timeout: DEFAULT_NOTIFICATION_TIMEOUT,
  })
  const navDrawerOpen = ref(false)

  const isNotificationActive = computed({
    get: () => notification.value.active,
    set: () => disableNotification(),
  })

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setSaving(value: boolean) {
    saving.value = value
  }

  function setTitle(value: string) {
    title.value = value
    setPageTitle(value)
  }

  function setPageTitle(pageTitle: string) {
    if (!import.meta.client) return
    const config = useRuntimeConfig()
    let prefix = pageTitle.trim()
    if (prefix === '') {
      prefix = 'Shopping List'
    }
    document.title = `${prefix} - ${config.public.appName}`
  }

  function addNotification(request: NotificationRequest) {
    notification.value = {
      active: true,
      message: request.message,
      type: request.type,
      timeout: Math.floor(Math.random() * 100) + DEFAULT_NOTIFICATION_TIMEOUT,
    }
  }

  function disableNotification() {
    notification.value = { ...notification.value, active: false }
  }

  function toggleNavDrawer() {
    navDrawerOpen.value = !navDrawerOpen.value
  }

  async function setNavDrawer(isOpen: boolean) {
    navDrawerOpen.value = isOpen

    const authStore = useAuthStore()
    const listStore = useListStore()
    if (!authStore.isLoggedIn || !listStore.stateLoaded) return

    await setDoc(
      doc(getFirestore(), 'states', authStore.user!.id),
      { navDrawerOpen: navDrawerOpen.value },
      { merge: true },
    )
  }

  return {
    loading,
    saving,
    title,
    notification,
    navDrawerOpen,
    isNotificationActive,
    setLoading,
    setSaving,
    setTitle,
    setPageTitle,
    addNotification,
    disableNotification,
    toggleNavDrawer,
    setNavDrawer,
  }
})
