import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users, apiTokens } from '../../database/schema'

const tokenLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().max(255).default('Mobile App'),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, tokenLoginSchema.parse)

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const token = crypto.randomBytes(32).toString('hex')

  await db.insert(apiTokens).values({
    token,
    name: body.name,
    userId: user.id,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }
})
