import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core' 

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    category: text('category').notNull(),
    priceCents: integer('price_cents').notNull(),
    stock: integer('stock').notNull().default(0),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: "timestamp" }).notNull().$defaultFn(() => new Date())
})
