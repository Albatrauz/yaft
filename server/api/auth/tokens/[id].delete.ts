import { eq, and } from 'drizzle-orm'
import { apiTokens } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: 'Invalid token ID' })
  }

  const [deleted] = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, user.id)))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Token not found' })
  }

  return { ok: true }
})
