import { z } from 'zod'
import { filaments } from '../../database/schema'

const createSchema = z.object({
  brand: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  colorName: z.string().min(1).max(255),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  price: z.number().positive(),
  purchasedAt: z.string(),
  weightTotal: z.number().int().positive().default(1000),
  weightRemaining: z.number().int().min(0).optional(),
  ironingSpeed: z.number().min(0).nullable().optional(),
  ironingFlow: z.number().min(0).nullable().optional(),
  ironingSpacing: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readValidatedBody(event, createSchema.parse)

  const [filament] = await db.insert(filaments).values({
    ...body,
    weightRemaining: body.weightRemaining ?? body.weightTotal,
    userId: session.user.id,
  }).returning()

  return filament
})
