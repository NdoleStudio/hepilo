export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (!import.meta.client) return

  const { getCurrentUser } = useFirebase()
  const user = await getCurrentUser()
  if (!user) {
    return navigateTo('/login')
  }

  // Ensure auth store is populated (handles race with plugin)
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    authStore.setUser({
      id: user.uid,
      name: user.displayName,
      photoURL: user.photoURL,
    })
  }
})
