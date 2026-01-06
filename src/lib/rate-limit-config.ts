/**
 * Rate limiting configuration for AI flashcard generation
 * Applies to all tiers including Pro to prevent abuse and control costs
 */

export interface RateLimitConfig {
  dailyLimit: number;
  hourlyLimit: number;
}

/**
 * Get rate limit configuration based on user tier
 * @param isPro - Whether the user has Pro subscription
 * @returns Rate limit configuration
 */
export function getRateLimitConfig(isPro: boolean): RateLimitConfig {
  // All users: 20 generations per day, no hourly limit
  return {
    dailyLimit: 20, // 20 generations per day
    hourlyLimit: Infinity, // No hourly limit
  };
}

/**
 * Check if a count exceeds the daily limit
 */
export function exceedsDailyLimit(count: number, limit: number): boolean {
  return count >= limit;
}

/**
 * Check if a count exceeds the hourly limit
 */
export function exceedsHourlyLimit(count: number, limit: number): boolean {
  return count >= limit;
}

