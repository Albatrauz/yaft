import { pgTable, text, varchar, real, integer, timestamp, date, boolean } from 'drizzle-orm/pg-core'

// ── better-auth tables ──────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ── application tables ──────────────────────────────────────────────────────

export const filaments = pgTable('filaments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  brand: varchar('brand', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  colorName: varchar('color_name', { length: 255 }).notNull(),
  colorHex: varchar('color_hex', { length: 7 }).notNull().default('#000000'),
  price: real('price').notNull(),
  purchasedAt: date('purchased_at').notNull(),
  weightTotal: integer('weight_total').notNull().default(1000),
  weightRemaining: integer('weight_remaining').notNull().default(1000),
  ironingSpeed: real('ironing_speed'),
  ironingFlow: real('ironing_flow'),
  ironingSpacing: real('ironing_spacing'),
  notes: text('notes'),
  userId: text('user_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
