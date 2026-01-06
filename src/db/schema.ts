import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Decks table - represents a collection of flashcards
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Cards table - individual flashcards within a deck
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(), // Front of the card (e.g., "Dog" or "When was the battle of hastings?")
  back: text().notNull(), // Back of the card (e.g., "Anjing" or "1066")
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Study sessions table - tracks study sessions for rate limiting
export const studySessionsTable = pgTable("study_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
});

// AI generation requests table - tracks AI flashcard generation for rate limiting
export const aiGenerationRequestsTable = pgTable("ai_generation_requests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
});