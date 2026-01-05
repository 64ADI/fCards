"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createCard, deleteCard, updateCard } from '@/db/queries/card-queries';
import { getDeckById } from '@/db/queries/deck-queries';

// Define Zod schema for validation
const createCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
});

const updateCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
  front: z.string().min(1, "Front text is required").optional(),
  back: z.string().min(1, "Back text is required").optional(),
});

// Define TypeScript types from Zod schemas
type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  // Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedData = createCardSchema.parse(input);
  
  // Verify deck ownership before creating card
  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // Call query function to insert into database
  const newCard = await createCard(
    validatedData.deckId,
    validatedData.front,
    validatedData.back
  );
  
  // Revalidate the deck page
  revalidatePath(`/dashboard/deck/${validatedData.deckId}`);
  
  return { success: true, card: newCard };
}

export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input
  const validatedData = updateCardSchema.parse(input);
  
  // Verify deck ownership
  const deck = await getDeckById(validatedData.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // Call query function to update
  const updatedCard = await updateCard(
    validatedData.cardId,
    {
      front: validatedData.front,
      back: validatedData.back,
    }
  );
  
  revalidatePath(`/dashboard/deck/${validatedData.deckId}`);
  
  return { success: true, card: updatedCard };
}

export async function deleteCardAction(cardId: number, deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify deck ownership
  const deck = await getDeckById(deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // Call query function to delete
  await deleteCard(cardId);
  
  revalidatePath(`/dashboard/deck/${deckId}`);
  
  return { success: true };
}

