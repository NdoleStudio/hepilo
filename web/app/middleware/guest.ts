export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (!import.meta.client) return

  const { getCurrentUser } = useFirebase()
  const user = await getCurrentUser()
  if (user) {
    return navigateTo('/lists')
  }
})
