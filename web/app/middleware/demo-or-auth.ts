export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (!import.meta.client) return

  const { getCurrentUser } = useFirebase()
  const user = await getCurrentUser()

  if (user) {
    // Ensure auth store is populated (handles race with plugin)
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      authStore.setUser({
        id: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
      })
    }
    return
  }

  // Allow demo users: those with existing local state populated via /demo
  try {
    const stored = JSON.parse(localStorage.getItem('states') ?? 'null')
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return
    }
  } catch {
    // Fall through to login redirect
  }

  return navigateTo('/login')
})
