import { getAuth } from 'firebase/auth'

export default defineNuxtRouteMiddleware((_to, _from) => {
  if (!import.meta.client) return

  const auth = getAuth()
  if (auth.currentUser) {
    return navigateTo('/lists')
  }
})
