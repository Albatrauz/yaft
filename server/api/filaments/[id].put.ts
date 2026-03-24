import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { filaments } from '../../database/schema'

const updateSchema = z.object({
  brand: z.string().min(1).max(255).optional(),
  type: z.string().min(1).max(100).optional(),
  colorName: z.string().min(1).max(255).optional(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  price: z.number().positive().optional(),
  purchasedAt: z.string().optional(),
  weightTotal: z.number().int().positive().optional(),
  weightRemaining: z.number().int().min(0).optional(),
  ironingSpeed: z.number().min(0).nullable().optional(),
  ironingFlow: z.number().min(0).nullable().optional(),
  ironingSpacing: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateSchema.parse)

  const [filament] = await db
    .update(filaments)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(filaments.id, id), eq(filaments.userId, user.id)))
    .returning()

  if (!filament) {
    throw createError({ statusCode: 404, message: 'Filament not found' })
  }

  return filament
})
