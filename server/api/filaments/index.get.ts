import { eq } from 'drizzle-orm'
import { filaments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const rows = await db
    .select()
    .from(filaments)
    .where(eq(filaments.userId, user.id))
    .orderBy(filaments.createdAt)

  return rows
})
