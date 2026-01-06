"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { generateText } from 'ai';
import { createHuggingFace } from '@ai-sdk/huggingface';
import { createCard, deleteCard, updateCard } from '@/db/queries/card-queries';
import { getDeckById } from '@/db/queries/deck-queries';
import { containsInappropriateContent, sanitizeForPrompt, filterInappropriateCards } from '@/lib/content-filter';
import { getRateLimitConfig, exceedsDailyLimit, exceedsHourlyLimit } from '@/lib/rate-limit-config';
import { getTodayAIGenerationCount, getHourlyAIGenerationCount, createAIGenerationRequest } from '@/db/queries/ai-generation-queries';

// Initialize Hugging Face provider
// Security: API key is only accessed server-side via process.env, never exposed to client
const getHuggingFaceProvider = () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    // Security: Error message doesn't expose the API key value
    throw new Error('HUGGINGFACE_API_KEY is not configured. Please set it in your environment variables.');
  }
  // Security: API key is passed directly to the provider, never logged or exposed
  return createHuggingFace({ apiKey });
};

// Get the model name from environment variable or use default
// Try these model names if one doesn't work:
// - 'meta-llama/Meta-Llama-3-8B-Instruct' (Llama 3, not 3.1)
// - 'meta-llama/Llama-3-8B-Instruct' (alternative format)
// Note: Some models may not be available via Inference API even if you accepted the license
const getModelName = (): string => {
  return process.env.HUGGINGFACE_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
};

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

// Zod schema for AI flashcard generation
const flashcardGenerationSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe('The front of the flashcard (question, word, term)'),
      back: z.string().describe('The back of the flashcard (answer, definition, translation)'),
    })
  ).describe('Array of flashcards to generate'),
});

/**
 * Generate flashcards using AI based on deck title and description
 * Generates 20-40 cards (randomly between these values)
 */
export async function generateFlashcardsAction(deckId: number) {
  // 1. Authenticate
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Check feature access
  if (!has({ feature: 'ai_flashcard_generation' })) {
    throw new Error("AI flashcard generation requires a Pro subscription.");
  }

  // 3. Verify deck ownership
  const deck = await getDeckById(deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Validate that deck has both name (title) and description
  if (!deck.name || deck.name.trim() === '') {
    throw new Error("Deck must have a title before generating cards with AI.");
  }
  
  if (!deck.description || deck.description.trim() === '') {
    throw new Error("Deck must have a description before generating cards with AI. Please add a description to your deck first.");
  }

  // 5. Content Filtering: Check for inappropriate content in deck name and description
  if (containsInappropriateContent(deck.name)) {
    console.warn(`[SECURITY] Inappropriate content detected in deck name for user ${userId}, deck ${deckId}`);
    throw new Error("Deck name contains inappropriate content. Please use appropriate language.");
  }
  
  if (deck.description && containsInappropriateContent(deck.description)) {
    console.warn(`[SECURITY] Inappropriate content detected in deck description for user ${userId}, deck ${deckId}`);
    throw new Error("Deck description contains inappropriate content. Please use appropriate language.");
  }

  // 6. Rate Limiting: Check daily limit (no hourly limit)
  const isPro = has({ plan: 'pro' });
  const rateLimitConfig = getRateLimitConfig(isPro);
  
  const todayCount = await getTodayAIGenerationCount(userId);
  
  if (exceedsDailyLimit(todayCount, rateLimitConfig.dailyLimit)) {
    console.warn(`[SECURITY] Daily rate limit exceeded for user ${userId}: ${todayCount}/${rateLimitConfig.dailyLimit}`);
    throw new Error(`You've reached your daily limit of ${rateLimitConfig.dailyLimit} AI generations. Please try again tomorrow.`);
  }
  
  // Hourly limit check removed - no hourly restrictions

  // 7. Generate random number of cards between 20-40
  const numberOfCards = Math.floor(Math.random() * 21) + 20; // 20-40 inclusive

    try {
      // 8. Generate flashcards using generateText (Hugging Face may not support generateObject)
      const huggingface = getHuggingFaceProvider();
      const modelName = getModelName();
      
      // Security: Log generation attempt (without sensitive data)
      console.log(`[AI_GENERATION] User ${userId} generating ${numberOfCards} cards for deck ${deckId}`);
      
      // 9. Input Sanitization: Sanitize deck name and description for prompt injection prevention
      const sanitizedName = sanitizeForPrompt(deck.name);
      const sanitizedDescription = sanitizeForPrompt(deck.description || '');
      
      // Request JSON format in the prompt since Hugging Face may not support structured outputs
      // Analyze the deck description to understand the context and generate appropriate flashcards
      const description = sanitizedDescription.toLowerCase();
      const title = sanitizedName.toLowerCase();
    
    // Detect if this is clearly a language translation deck (not just vocabulary)
    const isTranslationDeck = (
      (description.includes('translation') || description.includes('translate')) &&
      (description.includes('to ') || description.includes('from ') || 
       description.match(/\b(english|spanish|french|german|italian|portuguese|russian|chinese|japanese|korean|arabic|hindi|indonesian|polish|dutch|swedish|norwegian|danish|finnish|greek|turkish|hebrew|thai|vietnamese)\b/i))
    ) || (
      title.match(/\b(learning|learn)\b/i) &&
      description.match(/\b(english|spanish|french|german|italian|portuguese|russian|chinese|japanese|korean|arabic|hindi|indonesian|polish|dutch|swedish|norwegian|danish|finnish|greek|turkish|hebrew|thai|vietnamese)\b/i)
    );
    
    let prompt: string;
    
    if (isTranslationDeck) {
      // For clear translation/language learning decks, use direct translations
      // Use sanitized inputs to prevent prompt injection
      prompt = `You are a helpful assistant that generates flashcards in JSON format.

Generate exactly ${numberOfCards} flashcards for a deck titled "${sanitizedName}" with description: "${sanitizedDescription}".

Based on the deck description, generate flashcards that match the learning intent:
- For translation/language learning: Front should be a word or short phrase in the source language, Back should be ONLY the direct translation (no explanations)
- Keep both front and back SHORT and CONCISE
- NO questions in the front (e.g., don't write "What is the translation of...")
- NO explanations in the back (e.g., don't write "X means Y" or "X in [language] is Y")

Examples of appropriate flashcards:
- {"front":"car","back":"mobil"}
- {"front":"hello","back":"halo"}
- {"front":"thank you","back":"terima kasih"}

Deck Title: ${sanitizedName}
Deck Description: ${sanitizedDescription}
Number of cards to generate: ${numberOfCards}

CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations, no text before or after. Just the raw JSON:

{"cards":[{"front":"word1","back":"translation1"},{"front":"word2","back":"translation2"}]}`;
    } else {
      // For all other decks, generate contextually appropriate flashcards
      // Use sanitized inputs to prevent prompt injection
      prompt = `You are a helpful assistant that generates educational flashcards in JSON format.

Generate exactly ${numberOfCards} flashcards for a deck titled "${sanitizedName}" with description: "${sanitizedDescription}".

Generate flashcards that are appropriate for the deck's topic and learning goals. Analyze the deck title and description to understand what type of content would be most helpful.

GENERAL GUIDELINES (apply based on context):
- Keep flashcards SHORT and CONCISE - both front and back should be brief
- For vocabulary/terms: Use simple word-to-definition pairs
- For concepts: Use concise question-answer pairs
- For translations: Use direct word/phrase pairs without explanations
- Avoid overly complex questions or lengthy explanations
- Focus on what would be most effective for active recall learning

Examples of good flashcards (format varies by topic):
- Vocabulary: {"front":"photosynthesis","back":"process by which plants convert light to energy"}
- Translation: {"front":"hello","back":"hola"}
- Concepts: {"front":"Capital of France","back":"Paris"}
- Terms: {"front":"democracy","back":"government by the people"}

Deck Title: ${sanitizedName}
Deck Description: ${sanitizedDescription}
Number of cards to generate: ${numberOfCards}

CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations, no text before or after. Just the raw JSON:

{"cards":[{"front":"content1","back":"content2"},{"front":"content3","back":"content4"}]}`;
    }

    const { text } = await generateText({
      model: huggingface(modelName),
      prompt: prompt,
    });

    // 7. Parse the JSON response with robust repair for common issues
    let parsedResponse;
    
    // Helper function to repair JSON
    const repairJSON = (jsonString: string): string => {
      let repaired = jsonString.trim();
      
      // Remove markdown code blocks if present
      repaired = repaired.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any text before first { or [
      const firstBrace = Math.min(
        repaired.indexOf('{') !== -1 ? repaired.indexOf('{') : Infinity,
        repaired.indexOf('[') !== -1 ? repaired.indexOf('[') : Infinity
      );
      if (firstBrace !== Infinity && firstBrace > 0) {
        repaired = repaired.substring(firstBrace);
      }
      
      // Remove any text after last } or ]
      const lastBrace = Math.max(
        repaired.lastIndexOf('}'),
        repaired.lastIndexOf(']')
      );
      if (lastBrace !== -1) {
        repaired = repaired.substring(0, lastBrace + 1);
      }
      
      // Fix trailing commas before } or ]
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix missing commas between array elements (} followed by {)
      repaired = repaired.replace(/}\s*{/g, '},{');
      
      // Fix missing commas between object properties in arrays
      repaired = repaired.replace(/}\s*(\s*{)/g, '},$1');
      
      // Fix unescaped quotes in strings (basic attempt - be careful not to break valid JSON)
      // This is tricky, so we'll be conservative
      
      // Remove comments
      repaired = repaired.replace(/\/\/.*$/gm, '');
      repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');
      
      return repaired;
    };
    
    // Helper function to extract and repair cards array
    const extractCardsArray = (text: string): any[] => {
      // Try to find the cards array - use a more lenient match
      let arrayMatch = text.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        // Try to find array-like structure even if not perfectly formed
        const bracketStart = text.indexOf('[');
        const bracketEnd = text.lastIndexOf(']');
        if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
          arrayMatch = [text.substring(bracketStart, bracketEnd + 1)];
        }
      }
      
      if (!arrayMatch) {
        throw new Error('No array found in response');
      }
      
      let arrayText = arrayMatch[0];
      
      // Remove trailing commas (multiple passes to catch all)
      arrayText = arrayText.replace(/,(\s*])/g, '$1');
      arrayText = arrayText.replace(/,(\s*])/g, '$1'); // Second pass
      
      // Fix missing commas between objects (multiple patterns)
      arrayText = arrayText.replace(/}\s*{/g, '},{');
      arrayText = arrayText.replace(/}\s*\n\s*{/g, '},{');
      arrayText = arrayText.replace(/}\s*,\s*{/g, '},{'); // Remove duplicate commas
      
      // Fix missing commas after closing braces in arrays
      arrayText = arrayText.replace(/}\s*(\s*{)/g, '},$1');
      
      // Try to parse the full array
      try {
        const parsed = JSON.parse(arrayText);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If full parse fails, try to extract individual card objects using a more robust pattern
        // Match objects that contain both "front" and "back" keys
        const cardPattern = /\{[^{}]*(?:"front"\s*:\s*"[^"]*")[^{}]*(?:"back"\s*:\s*"[^"]*")[^{}]*\}/g;
        const cards: any[] = [];
        let match;
        
        // Reset regex lastIndex
        cardPattern.lastIndex = 0;
        
        while ((match = cardPattern.exec(arrayText)) !== null) {
          try {
            let cardText = match[0];
            // Try to repair the card object
            cardText = cardText.replace(/,(\s*})/g, '$1'); // Remove trailing commas
            const card = JSON.parse(cardText);
            if (card.front && card.back && typeof card.front === 'string' && typeof card.back === 'string') {
              cards.push(card);
            }
          } catch {
            // Try a more lenient extraction using regex
            const frontMatch = match[0].match(/"front"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            const backMatch = match[0].match(/"back"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            if (frontMatch && backMatch) {
              try {
                const front = JSON.parse(`"${frontMatch[1]}"`);
                const back = JSON.parse(`"${backMatch[1]}"`);
                cards.push({ front, back });
              } catch {
                // Skip this card
              }
            }
          }
        }
        
        if (cards.length > 0) {
          return cards;
        }
        
        throw e;
      }
      
      return [];
    };
    
    try {
      // Strategy 1: Try to parse the full JSON object
      let cleanedText = repairJSON(text);
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        let jsonText = jsonMatch[0];
        // Apply additional repairs
        jsonText = repairJSON(jsonText);
        
        try {
          parsedResponse = JSON.parse(jsonText);
          if (parsedResponse.cards && Array.isArray(parsedResponse.cards)) {
            console.log('Successfully parsed full JSON object');
          } else {
            throw new Error('Response does not contain cards array');
          }
        } catch (e) {
          // If full object parse fails, try extracting just the cards array
          parsedResponse = { cards: extractCardsArray(jsonText) };
          console.log('Successfully extracted cards array from JSON object');
        }
      } else {
        // Strategy 2: Try to extract just the cards array
        parsedResponse = { cards: extractCardsArray(cleanedText) };
        console.log('Successfully extracted cards array directly');
      }
      
      // Validate the parsed response
      if (!parsedResponse.cards || !Array.isArray(parsedResponse.cards)) {
        throw new Error('Response does not contain cards array');
      }
      
      // Filter out any invalid cards
      parsedResponse.cards = parsedResponse.cards.filter(
        (card: any) => card && typeof card === 'object' && card.front && card.back
      );
      
      if (parsedResponse.cards.length === 0) {
        throw new Error('No valid cards found in response');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response.');
      console.error('Raw response text (first 1000 chars):', text.substring(0, 1000));
      console.error('Parse error:', parseError);
      
      // Final fallback: try to extract cards using regex pattern matching
      try {
        // More flexible pattern that handles various formats
        // Look for "front": "..." and "back": "..." pairs, even if not in perfect JSON format
        const frontPattern = /"front"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        const backPattern = /"back"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        
        const frontMatches: string[] = [];
        const backMatches: string[] = [];
        
        let match;
        while ((match = frontPattern.exec(text)) !== null) {
          try {
            // Properly unescape JSON string
            const unescaped = match[1].replace(/\\"/g, '"')
                                      .replace(/\\n/g, '\n')
                                      .replace(/\\r/g, '\r')
                                      .replace(/\\t/g, '\t')
                                      .replace(/\\\\/g, '\\');
            frontMatches.push(unescaped);
          } catch {
            // Skip this match
          }
        }
        
        while ((match = backPattern.exec(text)) !== null) {
          try {
            // Properly unescape JSON string
            const unescaped = match[1].replace(/\\"/g, '"')
                                      .replace(/\\n/g, '\n')
                                      .replace(/\\r/g, '\r')
                                      .replace(/\\t/g, '\t')
                                      .replace(/\\\\/g, '\\');
            backMatches.push(unescaped);
          } catch {
            // Skip this match
          }
        }
        
        // Pair up front and back matches (they should be in order)
        const cards: any[] = [];
        const minLength = Math.min(frontMatches.length, backMatches.length);
        for (let i = 0; i < minLength; i++) {
          if (frontMatches[i] && backMatches[i]) {
            cards.push({
              front: frontMatches[i],
              back: backMatches[i]
            });
          }
        }
        
        if (cards.length > 0) {
          parsedResponse = { cards };
          console.log(`Successfully extracted ${cards.length} cards using regex pattern matching`);
        } else {
          throw new Error('Could not extract any cards using pattern matching');
        }
      } catch (finalError) {
        // Provide helpful error message
        let errorMessage = 'AI generated invalid response format. ';
        if (parseError instanceof Error) {
          errorMessage += `Error: ${parseError.message}. `;
        }
        errorMessage += 'Please try again. If the problem persists, the model may not be suitable for structured output generation.';
        
        throw new Error(errorMessage);
      }
    }

    // 10. Validate the parsed response matches our schema
    const validatedData = flashcardGenerationSchema.parse(parsedResponse);

    // 11. Response Filtering: Filter out any cards with inappropriate content
    const originalCount = validatedData.cards.length;
    const filteredCards = filterInappropriateCards(validatedData.cards);
    const filteredCount = originalCount - filteredCards.length;
    
    if (filteredCount > 0) {
      console.warn(`[SECURITY] Filtered ${filteredCount} inappropriate card(s) from AI response for user ${userId}, deck ${deckId}`);
    }
    
    if (filteredCards.length === 0) {
      throw new Error('No appropriate cards could be generated. Please try again with a different deck description.');
    }

    // 12. Create cards in database
    const createdCards = [];
    for (const card of filteredCards) {
      const newCard = await createCard(deckId, card.front, card.back);
      createdCards.push(newCard);
    }

    // 13. Log successful generation request for rate limiting
    await createAIGenerationRequest(userId, deckId);
    console.log(`[AI_GENERATION] Successfully generated ${createdCards.length} cards for user ${userId}, deck ${deckId}`);

    // 14. Revalidate the deck page
    revalidatePath(`/dashboard/deck/${deckId}`);

    return { 
      success: true, 
      cards: createdCards,
      count: createdCards.length 
    };
  } catch (error) {
    // Security: Log errors without exposing sensitive information (API keys, etc.)
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    // Ensure API keys are never logged
    const safeErrorDetails = errorDetails.replace(/HUGGINGFACE_API_KEY[=:]\s*[^\s]+/gi, 'HUGGINGFACE_API_KEY=***');
    
    console.error(`[AI_GENERATION_ERROR] User ${userId}, Deck ${deckId}: ${safeErrorDetails}`);
    
    // Security: Don't expose internal error details to client
    // Only expose user-friendly messages
    let errorMessage = 'Failed to generate flashcards. Please try again.';
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Handle specific error types with user-friendly messages
      if (errorMsg.includes('inappropriate content')) {
        errorMessage = error.message; // Use the specific content filter message
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('limit')) {
        errorMessage = error.message; // Use the specific rate limit message
      } else if (errorMsg.includes('does not exist') || errorMsg.includes('not found')) {
        const modelName = getModelName();
        // Security: Only log model name, never API key
        errorMessage = `Model '${modelName}' does not exist or is not available on Hugging Face Inference API.\n\n` +
          `Possible solutions:\n` +
          `1. Try a different model by setting HUGGINGFACE_MODEL in .env.local\n` +
          `2. Some models (like Llama) may not be available via Inference API even after accepting the license\n` +
          `3. Try: 'meta-llama/Meta-Llama-3-8B-Instruct' (Llama 3, not 3.1)\n` +
          `4. Visit https://huggingface.co/models and filter by "Inference API" to find available models`;
      } else if (errorMsg.includes('unauthorized') || errorMsg.includes('forbidden')) {
        errorMessage = 'You do not have permission to perform this action.';
      } else {
        // Generic error - don't expose internal details
        errorMessage = 'Failed to generate flashcards. Please try again.';
      }
    }
    
    throw new Error(errorMessage);
  }
}

