import { db } from '@/db';
import { cardsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Fetch all cards for a deck
export async function getDeckCards(deckId: number) {
  return await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt), desc(cardsTable.id));
}

// Fetch a single card by ID
export async function getCardById(cardId: number) {
  const [card] = await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId));
  return card;
}

// Create a new card
export async function createCard(deckId: number, front: string, back: string) {
  const [newCard] = await db.insert(cardsTable)
    .values({
      deckId,
      front,
      back,
    })
    .returning();
  return newCard;
}

// Update a card
export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  const [updatedCard] = await db.update(cardsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  return updatedCard;
}

// Delete a card
export async function deleteCard(cardId: number) {
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

