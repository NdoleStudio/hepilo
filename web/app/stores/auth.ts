import { getFirestore, doc, deleteDoc } from 'firebase/firestore'
import type { User } from '~/types/state'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => user.value !== null)
  const hasProfilePicture = computed(
    () => user.value !== null && user.value.photoURL !== null,
  )

  function setUser(newUser: User | null) {
    if (user.value === newUser) return
    user.value = newUser
  }

  async function deleteAccount(userId: string) {
    const uiStore = useUIStore()
    const listStore = useListStore()

    uiStore.setSaving(true)
    listStore.resetState()
    await deleteDoc(doc(getFirestore(), 'states', userId))

    uiStore.addNotification({
      type: 'success',
      message: 'Your account has been deleted successfully',
    })
    uiStore.setSaving(false)
  }

  function resetAuth() {
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    hasProfilePicture,
    setUser,
    deleteAccount,
    resetAuth,
  }
})
