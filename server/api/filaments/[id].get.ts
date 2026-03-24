import { eq, and } from 'drizzle-orm'
import { filaments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const [filament] = await db
    .select()
    .from(filaments)
    .where(and(eq(filaments.id, id), eq(filaments.userId, user.id)))
    .limit(1)

  if (!filament) {
    throw createError({ statusCode: 404, message: 'Filament not found' })
  }

  return filament
})
