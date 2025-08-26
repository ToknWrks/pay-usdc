import { pgTable, text, timestamp, boolean, serial, decimal, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nobleAddress: text('noble_address').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
})

// Updated: Recipient Lists table with listType
export const recipientLists = pgTable('recipient_lists', {
  id: serial('id').primaryKey(),
  ownerAddress: text('owner_address').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  listType: text('list_type').notNull().default('fixed'), // 'fixed' or 'percentage'
  totalRecipients: integer('total_recipients').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Updated: Recipients table with percentage field
export const savedRecipients = pgTable('saved_recipients', {
  id: serial('id').primaryKey(),
  listId: integer('list_id').references(() => recipientLists.id).notNull(),
  name: text('name'),
  address: text('address').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }), // For fund percentage (0-100.00)
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// Existing batch and transaction tables
export const batches = pgTable('batches', {
  id: serial('id').primaryKey(),
  senderAddress: text('sender_address').notNull(),
  txHash: text('tx_hash').notNull().unique(),
  totalAmount: decimal('total_amount', { precision: 18, scale: 6 }).notNull(),
  totalRecipients: integer('total_recipients').notNull(),
  status: text('status').notNull().default('pending'),
  blockHeight: text('block_height'),
  gasUsed: text('gas_used'),
  gasPrice: text('gas_price'),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').references(() => batches.id),
  senderAddress: text('sender_address').notNull(),
  recipientName: text('recipient_name'),
  recipientAddress: text('recipient_address').notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  ownerAddress: text('owner_address').notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  email: text('email'), // Add email field
  phone: text('phone'), // Add phone field
  description: text('description'),
  tags: text('tags'), // Comma-separated tags like "team,developer,frequent"
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type RecipientList = typeof recipientLists.$inferSelect
export type NewRecipientList = typeof recipientLists.$inferInsert
export type SavedRecipient = typeof savedRecipients.$inferSelect
export type NewSavedRecipient = typeof savedRecipients.$inferInsert
export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert