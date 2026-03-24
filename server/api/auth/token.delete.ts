import { eq, and } from 'drizzle-orm'
import { apiTokens } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 400, message: 'No bearer token to revoke' })
  }

  const token = authHeader.slice(7)

  await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.token, token), eq(apiTokens.userId, user.id)))

  return { ok: true }
})
