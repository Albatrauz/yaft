import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import bcrypt from 'bcrypt'
import * as schema from './schema'

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

  console.log('Seeding database...')

  // Create admin user
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10)
  const [user] = await db.insert(schema.users).values({
    email: process.env.ADMIN_EMAIL || 'admin@yaft.local',
    passwordHash,
    name: 'Admin',
  }).onConflictDoNothing().returning()

  const userId = user?.id ?? 1

  // Seed filaments
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

  await pool.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
