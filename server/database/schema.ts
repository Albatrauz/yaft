import { pgTable, serial, varchar, text, real, integer, timestamp, date } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const filaments = pgTable('filaments', {
  id: serial('id').primaryKey(),
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
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
