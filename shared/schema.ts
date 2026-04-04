import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull().default('New Chat'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  sources: text('sources'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
