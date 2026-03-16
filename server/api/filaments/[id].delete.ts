import { eq, and } from 'drizzle-orm'
import { filaments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const [filament] = await db
    .delete(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, session.user.id)))
    .returning()

  if (!filament) {
    throw createError({ statusCode: 404, message: 'Filament not found' })
  }

  return { ok: true }
})
