"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createDeck, deleteDeck, updateDeck } from '@/db/queries/deck-queries';

// Define Zod schema for validation
const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
});

const updateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().optional(),
});

// Define TypeScript types from Zod schemas
type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  // Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedData = createDeckSchema.parse(input);
  
  // Call query function to insert into database
  const newDeck = await createDeck(
    userId,
    validatedData.name,
    validatedData.description
  );
  
  // Revalidate the page cache
  revalidatePath('/dashboard');
  
  return { success: true, deck: newDeck };
}

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input
  const validatedData = updateDeckSchema.parse(input);
  
  // Call query function to update
  const updatedDeck = await updateDeck(
    validatedData.deckId,
    userId,
    {
      name: validatedData.name,
      description: validatedData.description,
    }
  );
  
  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/deck/${validatedData.deckId}`);
  
  return { success: true, deck: updatedDeck };
}

export async function deleteDeckAction(deckId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Call query function to delete with ownership verification
  await deleteDeck(deckId, userId);
  
  revalidatePath('/dashboard');
  
  // Redirect to dashboard after deletion
  redirect('/dashboard');
}

