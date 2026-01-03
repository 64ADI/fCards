import { db } from '@/db';
import { decksTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Fetch all decks for a user
export async function getUserDecks(userId: string) {
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

// Fetch a single deck by ID (with ownership verification)
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db.select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    );
  return deck;
}

// Create a new deck
export async function createDeck(userId: string, name: string, description?: string) {
  const [newDeck] = await db.insert(decksTable)
    .values({
      userId,
      name,
      description,
    })
    .returning();
  return newDeck;
}

// Update a deck
export async function updateDeck(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string }
) {
  const [updatedDeck] = await db.update(decksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .returning();
  return updatedDeck;
}

// Delete a deck
export async function deleteDeck(deckId: number, userId: string) {
  await db.delete(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    );
}

