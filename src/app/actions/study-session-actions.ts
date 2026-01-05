"use server";

import { auth } from '@clerk/nextjs/server';
import { createStudySession, getTodayStudySessionCount } from '@/db/queries/study-session-queries';

const DAILY_STUDY_SESSION_LIMIT = 40;

/**
 * Start a study session - checks if user has reached daily limit
 * Returns { success: true } if allowed, or { success: false, error: string } if limit reached
 */
export async function startStudySessionAction(deckId: number) {
  const { userId, has } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Check if user has unlimited study sessions feature
  const hasUnlimited = has({ feature: 'unlimited_study_sessions' });
  
  if (!hasUnlimited) {
    // Check current session count for today
    const todayCount = await getTodayStudySessionCount(userId);
    
    if (todayCount >= DAILY_STUDY_SESSION_LIMIT) {
      return {
        success: false,
        error: `You've reached your daily limit of ${DAILY_STUDY_SESSION_LIMIT} study sessions. Upgrade to Pro for unlimited study sessions.`,
        count: todayCount,
        limit: DAILY_STUDY_SESSION_LIMIT,
      };
    }
  }
  
  // Create the study session record
  await createStudySession(userId, deckId);
  
  return { success: true };
}

/**
 * Get remaining study sessions for the current user
 * Returns the count of remaining sessions today
 * @param accountForCurrentSession - If true, subtracts 1 to account for a session that will be recorded
 */
export async function getRemainingStudySessionsAction(accountForCurrentSession: boolean = false) {
  const { userId, has } = await auth();
  
  if (!userId) {
    return { remaining: 0, limit: DAILY_STUDY_SESSION_LIMIT };
  }
  
  // Check if user has unlimited study sessions feature
  const hasUnlimited = has({ feature: 'unlimited_study_sessions' });
  
  if (hasUnlimited) {
    return { remaining: null, limit: null }; // null means unlimited
  }
  
  // Get current session count for today
  const todayCount = await getTodayStudySessionCount(userId);
  let remaining = Math.max(0, DAILY_STUDY_SESSION_LIMIT - todayCount);
  
  // If accounting for current session, subtract 1 (for a session that will be recorded)
  if (accountForCurrentSession) {
    remaining = Math.max(0, remaining - 1);
  }
  
  return { remaining, limit: DAILY_STUDY_SESSION_LIMIT };
}

