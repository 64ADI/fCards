import { db } from '@/db';
import { aiGenerationRequestsTable } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Count AI generation requests for a user today (UTC date)
 */
export async function getTodayAIGenerationCount(userId: string): Promise<number> {
  // Get start of today in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiGenerationRequestsTable)
    .where(
      and(
        eq(aiGenerationRequestsTable.userId, userId),
        gte(aiGenerationRequestsTable.createdAt, today)
      )
    );
  
  return Number(result[0]?.count ?? 0);
}

/**
 * Count AI generation requests for a user in the last hour (rolling window)
 */
export async function getHourlyAIGenerationCount(userId: string): Promise<number> {
  // Get timestamp for 1 hour ago
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiGenerationRequestsTable)
    .where(
      and(
        eq(aiGenerationRequestsTable.userId, userId),
        gte(aiGenerationRequestsTable.createdAt, oneHourAgo)
      )
    );
  
  return Number(result[0]?.count ?? 0);
}

/**
 * Create a new AI generation request record
 */
export async function createAIGenerationRequest(userId: string, deckId: number) {
  const [newRequest] = await db
    .insert(aiGenerationRequestsTable)
    .values({
      userId,
      deckId,
    })
    .returning();
  
  return newRequest;
}

