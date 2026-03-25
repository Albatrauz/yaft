import { eq } from 'drizzle-orm'
import { filaments } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const rows = await db
    .select()
    .from(filaments)
    .where(eq(filaments.userId, session.user.id))
    .orderBy(filaments.createdAt)

  return rows
})
