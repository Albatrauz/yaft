import { auth } from './auth'

export async function requireAuth(event: any) {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  return session
}
