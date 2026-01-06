/**
 * Content filtering utility for detecting inappropriate content
 * Filters curse words, slurs, and other inappropriate language
 */

// Curated list of inappropriate terms
// This is a basic implementation - can be enhanced with external services
const INAPPROPRIATE_WORDS = [
  // Common profanity (basic list - can be expanded)
  'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard',
  // Racial slurs and hate speech (representative examples - should be comprehensive)
  'nigger', 'nigga', 'kike', 'spic', 'chink', 'gook', 'wetback',
  // Other offensive terms
  'retard', 'retarded', 'faggot', 'dyke', 'tranny',
];

// Pattern matching for common obfuscations (e.g., f*ck, f-u-c-k, etc.)
const OBFUSCATION_PATTERNS = [
  /f[*\-_]{0,2}u[*\-_]{0,2}c[*\-_]{0,2}k/gi,
  /s[*\-_]{0,2}h[*\-_]{0,2}i[*\-_]{0,2}t/gi,
  /d[*\-_]{0,2}a[*\-_]{0,2}m[*\-_]{0,2}n/gi,
  /a[*\-_]{0,2}s[*\-_]{0,2}s/gi,
  /b[*\-_]{0,2}i[*\-_]{0,2}t[*\-_]{0,2}c[*\-_]{0,2}h/gi,
];

/**
 * Checks if text contains inappropriate content
 * @param text - The text to check
 * @returns true if inappropriate content is found, false otherwise
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const normalizedText = text.toLowerCase().trim();

  // Check against word list
  for (const word of INAPPROPRIATE_WORDS) {
    // Use word boundaries to avoid false positives (e.g., "class" containing "ass")
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      return true;
    }
  }

  // Check against obfuscation patterns
  for (const pattern of OBFUSCATION_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes text for use in AI prompts to prevent prompt injection
 * @param text - The text to sanitize
 * @returns Sanitized text safe for use in prompts
 */
export function sanitizeForPrompt(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove or escape potentially dangerous characters for prompt injection
  let sanitized = text
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length to prevent abuse
    .slice(0, 1000)
    // Trim whitespace
    .trim();

  // Escape special characters that could be used for prompt manipulation
  // Replace newlines with spaces to prevent multi-line injection
  sanitized = sanitized.replace(/\n/g, ' ').replace(/\r/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Filters an array of cards, removing any with inappropriate content
 * @param cards - Array of cards with front and back properties
 * @returns Filtered array with inappropriate cards removed
 */
export function filterInappropriateCards(cards: Array<{ front: string; back: string }>): Array<{ front: string; back: string }> {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.filter(card => {
    if (!card || typeof card !== 'object') {
      return false;
    }

    const front = card.front || '';
    const back = card.back || '';

    // Remove card if either front or back contains inappropriate content
    return !containsInappropriateContent(front) && !containsInappropriateContent(back);
  });
}

