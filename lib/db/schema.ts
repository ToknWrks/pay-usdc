import { pgTable, text, timestamp, boolean, serial, decimal, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nobleAddress: text('noble_address').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
})

// New: Recipient Lists table
export const recipientLists = pgTable('recipient_lists', {
  id: serial('id').primaryKey(),
  ownerAddress: text('owner_address').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  totalRecipients: integer('total_recipients').default(0),
  totalAmount: decimal('total_amount', { precision: 18, scale: 6 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// New: Recipients table (for saved lists)
export const savedRecipients = pgTable('saved_recipients', {
  id: serial('id').primaryKey(),
  listId: integer('list_id').references(() => recipientLists.id).notNull(),
  name: text('name'),
  address: text('address').notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// Updated: Batch transactions table
export const batches = pgTable('batches', {
  id: serial('id').primaryKey(),
  senderAddress: text('sender_address').notNull(),
  txHash: text('tx_hash').notNull().unique(), // Single blockchain transaction hash
  totalAmount: decimal('total_amount', { precision: 18, scale: 6 }).notNull(),
  totalRecipients: integer('total_recipients').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'failed'
  blockHeight: text('block_height'),
  gasUsed: text('gas_used'),
  gasPrice: text('gas_price'),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
})

// Updated: Individual transactions table (references batch)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  
  // Batch reference
  batchId: integer('batch_id').references(() => batches.id),
  
  // Individual transaction details
  senderAddress: text('sender_address').notNull(),
  recipientName: text('recipient_name'), // Optional name for recipient
  recipientAddress: text('recipient_address').notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  
  // Individual status (inherits from batch, but can be overridden for failed individual sends)
  status: text('status').notNull().default('pending'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
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