import { pgTable, text, integer, real, boolean, timestamp, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const categoryEnum = pgEnum('product_category', [
  'Bebidas', 'Alimentos', 'Electrónica', 'Ropa', 'Higiene', 'Hogar', 'Otros',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash', 'card', 'transfer',
]);

export const saleStatusEnum = pgEnum('sale_status', [
  'pending', 'completed', 'cancelled', 'refunded',
]);

export const userRoleEnum = pgEnum('user_role', ['admin', 'cashier']);

// ─── Businesses ──────────────────────────────────────────────────────────────

export const businesses = pgTable('businesses', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  address:   text('address'),
  phone:     text('phone'),
  email:     text('email'),
  taxId:     text('tax_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  businessId:   uuid('business_id').references(() => businesses.id).notNull(),
  name:         text('name').notNull(),
  email:        text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role:         userRoleEnum('role').default('cashier').notNull(),
  isActive:     boolean('is_active').default(true).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id:          uuid('id').primaryKey().defaultRandom(),
  businessId:  uuid('business_id').references(() => businesses.id).notNull(),
  name:        text('name').notNull(),
  description: text('description').default(''),
  price:       real('price').notNull(),
  cost:        real('cost').default(0).notNull(),
  stock:       integer('stock').default(0).notNull(),
  minStock:    integer('min_stock').default(5).notNull(),
  category:    categoryEnum('category').default('Otros').notNull(),
  barcode:     text('barcode'),
  unit:        text('unit').default('pieza').notNull(),
  taxRate:     real('tax_rate').default(0).notNull(),
  isActive:    boolean('is_active').default(true).notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = pgTable('customers', {
  id:              uuid('id').primaryKey().defaultRandom(),
  businessId:      uuid('business_id').references(() => businesses.id).notNull(),
  name:            text('name').notNull(),
  email:           text('email'),
  phone:           text('phone'),
  address:         text('address'),
  notes:           text('notes'),
  totalPurchases:  integer('total_purchases').default(0).notNull(),
  totalSpent:      real('total_spent').default(0).notNull(),
  lastPurchaseAt:  timestamp('last_purchase_at'),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
});

// ─── Sales ────────────────────────────────────────────────────────────────────

export const sales = pgTable('sales', {
  id:            uuid('id').primaryKey().defaultRandom(),
  businessId:    uuid('business_id').references(() => businesses.id).notNull(),
  customerId:    uuid('customer_id').references(() => customers.id),
  userId:        uuid('user_id').references(() => users.id).notNull(),
  ticketNumber:  text('ticket_number').notNull(),
  subtotal:      real('subtotal').notNull(),
  tax:           real('tax').default(0).notNull(),
  discount:      real('discount').default(0).notNull(),
  total:         real('total').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  amountPaid:    real('amount_paid').notNull(),
  change:        real('change').default(0).notNull(),
  status:        saleStatusEnum('status').default('completed').notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
});

// ─── Sale Items ───────────────────────────────────────────────────────────────

export const saleItems = pgTable('sale_items', {
  id:         uuid('id').primaryKey().defaultRandom(),
  saleId:     uuid('sale_id').references(() => sales.id, { onDelete: 'cascade' }).notNull(),
  productId:  uuid('product_id').references(() => products.id).notNull(),
  productName: text('product_name').notNull(), // snapshot at time of sale
  unitPrice:  real('unit_price').notNull(),
  quantity:   integer('quantity').notNull(),
  subtotal:   real('subtotal').notNull(),
  discount:   real('discount').default(0).notNull(),
});

// ─── Chat Sessions ────────────────────────────────────────────────────────────

export const chatSessions = pgTable('chat_sessions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  userId:     uuid('user_id').references(() => users.id).notNull(),
  messages:   jsonb('messages').default([]).notNull(), // ChatMessage[]
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const salesRelations = relations(sales, ({ many, one }) => ({
  items:    many(saleItems),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale:    one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, { fields: [products.businessId], references: [businesses.id] }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Business    = typeof businesses.$inferSelect;
export type User        = typeof users.$inferSelect;
export type Product     = typeof products.$inferSelect;
export type Customer    = typeof customers.$inferSelect;
export type Sale        = typeof sales.$inferSelect;
export type SaleItem    = typeof saleItems.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;

export type NewProduct  = typeof products.$inferInsert;
export type NewSale     = typeof sales.$inferInsert;
export type NewSaleItem = typeof saleItems.$inferInsert;
export type NewCustomer = typeof customers.$inferInsert;
