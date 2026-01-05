import { db } from '@/db';
import { studySessionsTable } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Count study sessions for a user today (UTC date)
 */
export async function getTodayStudySessionCount(userId: string): Promise<number> {
  // Get start of today in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studySessionsTable)
    .where(
      and(
        eq(studySessionsTable.userId, userId),
        gte(studySessionsTable.createdAt, today)
      )
    );
  
  return Number(result[0]?.count ?? 0);
}

/**
 * Create a new study session record
 */
export async function createStudySession(userId: string, deckId: number) {
  const [newSession] = await db
    .insert(studySessionsTable)
    .values({
      userId,
      deckId,
    })
    .returning();
  
  return newSession;
}

