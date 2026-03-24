import { eq } from 'drizzle-orm'
import { apiTokens, users } from '../database/schema'

export async function requireAuth(event: any) {
  const authHeader = getHeader(event, 'authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    const [row] = await db
      .select({
        tokenId: apiTokens.id,
        userId: users.id,
        email: users.email,
        name: users.name,
      })
      .from(apiTokens)
      .innerJoin(users, eq(apiTokens.userId, users.id))
      .where(eq(apiTokens.token, token))
      .limit(1)

    if (!row) {
      throw createError({ statusCode: 401, message: 'Invalid API token' })
    }

    // Fire-and-forget: update lastUsedAt
    db.update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, row.tokenId))
      .then(() => {})
      .catch(() => {})

    return { user: { id: row.userId, email: row.email, name: row.name } }
  }

  return await requireUserSession(event)
}
