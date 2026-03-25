import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import * as schema from './schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

async function seed() {
  const pool = new pg.Pool(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER || 'user',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'yaft',
        },
  )
  const db = drizzle(pool, { schema })

  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET || 'seed-secret-at-least-32-characters-long',
  })

  console.log('Seeding database...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yaft.local'

  // Create admin user via better-auth API, or find existing
  let userId: string
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: 'Admin',
      },
    })
    userId = result.user.id
    console.log(`Created admin user ${userId}`)
  } catch {
    // User likely already exists — look up by exact email
    const [existingUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, adminEmail))
    if (!existingUser) {
      throw new Error(`Failed to create or find admin user with email ${adminEmail}`)
    }
    userId = existingUser.id
    console.log(`Found existing admin user ${userId}`)
  }

  await seedFilaments(db, userId)

  await pool.end()
  process.exit(0)
}

async function seedFilaments(db: any, userId: string) {
  const filamentData = [
    {
      brand: 'Bambu Lab',
      type: 'PLA Matte',
      colorName: 'Charcoal Black',
      colorHex: '#2d2d2d',
      price: 19.99,
      purchasedAt: '2025-11-15',
      weightTotal: 1000,
      weightRemaining: 720,
      ironingSpeed: 15,
      ironingFlow: 10,
      ironingSpacing: 0.1,
      notes: 'Great matte finish, minimal stringing',
      userId,
    },
    {
      brand: 'Bambu Lab',
      type: 'PLA Basic',
      colorName: 'Bambu Green',
      colorHex: '#00a651',
      price: 15.99,
      purchasedAt: '2025-10-20',
      weightTotal: 1000,
      weightRemaining: 450,
      ironingSpeed: 15,
      ironingFlow: 10,
      ironingSpacing: 0.1,
      notes: null,
      userId,
    },
    {
      brand: 'Polymaker',
      type: 'PLA',
      colorName: 'Polyterra Cotton White',
      colorHex: '#f5f0e8',
      price: 21.99,
      purchasedAt: '2025-09-05',
      weightTotal: 1000,
      weightRemaining: 200,
      ironingSpeed: 15,
      ironingFlow: 12,
      ironingSpacing: 0.1,
      notes: 'Almost done, reorder soon',
      userId,
    },
    {
      brand: 'Prusament',
      type: 'PETG',
      colorName: 'Prusa Orange',
      colorHex: '#f7941d',
      price: 28.99,
      purchasedAt: '2025-12-01',
      weightTotal: 1000,
      weightRemaining: 980,
      ironingSpeed: 10,
      ironingFlow: 15,
      ironingSpacing: 0.15,
      notes: 'PETG - use enclosure, bed at 85C',
      userId,
    },
    {
      brand: 'Bambu Lab',
      type: 'PLA Matte',
      colorName: 'Mandarin Orange',
      colorHex: '#ff6b35',
      price: 19.99,
      purchasedAt: '2026-01-10',
      weightTotal: 1000,
      weightRemaining: 1000,
      ironingSpeed: 15,
      ironingFlow: 10,
      ironingSpacing: 0.1,
      notes: 'Unopened',
      userId,
    },
    {
      brand: 'eSUN',
      type: 'ABS+',
      colorName: 'Fire Engine Red',
      colorHex: '#c41e3a',
      price: 18.49,
      purchasedAt: '2025-08-22',
      weightTotal: 1000,
      weightRemaining: 600,
      ironingSpeed: 12,
      ironingFlow: 8,
      ironingSpacing: 0.12,
      notes: 'Needs enclosure, 100C bed',
      userId,
    },
    {
      brand: 'Polymaker',
      type: 'TPU',
      colorName: 'PolyFlex Black',
      colorHex: '#1a1a1a',
      price: 32.99,
      purchasedAt: '2025-07-30',
      weightTotal: 750,
      weightRemaining: 500,
      ironingSpeed: 0,
      ironingFlow: 0,
      ironingSpacing: 0,
      notes: 'Do NOT iron TPU. Direct drive only, 25mm/s max',
      userId,
    },
    {
      brand: 'Bambu Lab',
      type: 'PLA Matte',
      colorName: 'Lemon Yellow',
      colorHex: '#fff44f',
      price: 19.99,
      purchasedAt: '2026-02-14',
      weightTotal: 1000,
      weightRemaining: 850,
      ironingSpeed: 15,
      ironingFlow: 10,
      ironingSpacing: 0.1,
      notes: null,
      userId,
    },
  ]

  await db.insert(schema.filaments).values(filamentData).onConflictDoNothing()

  console.log(`Seeded ${filamentData.length} filaments for user ${userId}`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
