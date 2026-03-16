import { eq } from 'drizzle-orm'
import { filaments } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const rows = await db
    .select()
    .from(filaments)
    .where(eq(filaments.userId, session.user.id))
    .orderBy(filaments.createdAt)

  return rows
})
