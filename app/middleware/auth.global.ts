export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login', '/register']

  let isAuthenticated = false

  if (import.meta.server) {
    const event = useRequestEvent()
    isAuthenticated = !!event?.context.auth
  } else {
    const session = authClient.useSession()
    isAuthenticated = !!session.value.data
  }

  if (publicRoutes.includes(to.path)) {
    if (isAuthenticated) return navigateTo('/')
    return
  }

  if (!isAuthenticated) return navigateTo('/login')
})
