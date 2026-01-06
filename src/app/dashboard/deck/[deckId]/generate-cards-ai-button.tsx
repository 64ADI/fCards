"use client";

import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateFlashcardsAction } from '@/app/actions/card-actions';
import { toast } from 'sonner';

interface GenerateCardsAIButtonProps {
  deckId: number;
  hasAIFeature: boolean;
  deckName: string;
  deckDescription: string | null;
}

export function GenerateCardsAIButton({ deckId, hasAIFeature, deckName, deckDescription }: GenerateCardsAIButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if deck has required fields for AI generation
  const hasTitle = deckName && deckName.trim() !== '';
  const hasDescription = deckDescription && deckDescription.trim() !== '';
  const canGenerate = hasTitle && hasDescription;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    if (!hasAIFeature) {
      // Redirect to pricing page if user doesn't have the feature
      router.push('/pricing');
      return;
    }

    if (!canGenerate) {
      // Show error toast if deck is missing required fields (especially important on mobile)
      if (!hasDescription) {
        toast.error('Please add a description to your deck before generating cards with AI.');
      } else if (!hasTitle) {
        toast.error('Deck must have a title before generating cards with AI.');
      }
      return;
    }

    // Generate flashcards if user has the feature and deck is valid
    startTransition(async () => {
      try {
        const result = await generateFlashcardsAction(deckId);
        toast.success(`Successfully generated ${result.count} flashcards!`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards';
        toast.error(errorMessage);
      }
    });
  };

  // On mobile, don't disable button for missing requirements - let click handler show toast
  // On desktop, disable to show tooltip
  const isDisabled = isPending || (!isMobile && hasAIFeature && !canGenerate);

  // Determine tooltip message based on state
  let tooltipMessage: string;
  if (isPending) {
    tooltipMessage = 'Generating flashcards...';
  } else if (!hasAIFeature) {
    tooltipMessage = 'AI flashcard generation is a Pro feature. Upgrade to unlock this feature.';
  } else if (!canGenerate) {
    if (!hasDescription) {
      tooltipMessage = 'Please add a description to your deck before generating cards with AI.';
    } else if (!hasTitle) {
      tooltipMessage = 'Deck must have a title before generating cards with AI.';
    } else {
      tooltipMessage = 'Deck must have both a title and description to generate cards with AI.';
    }
  } else {
    tooltipMessage = 'Generate flashcards using AI';
  }

  const button = (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={hasAIFeature ? "default" : "outline"}
      className="gap-2"
      size={isMobile ? "sm" : "default"}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
          <span className="sm:hidden">Generating</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Generate Cards with AI</span>
          <span className="sm:hidden">Generate AI</span>
        </>
      )}
    </Button>
  );

  // On mobile, tooltips don't work well, so we rely on toast messages
  // On desktop, show tooltip for better UX
  if (isMobile) {
    // On mobile, just return the button - toast will handle feedback when clicked
    return button;
  }

  // Desktop: Always wrap button in tooltip to show why it's disabled
  // Wrap disabled button in span so tooltip works (disabled elements don't trigger pointer events)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isDisabled ? (
          <span className="inline-block cursor-not-allowed">
            {button}
          </span>
        ) : (
          button
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipMessage}</p>
      </TooltipContent>
    </Tooltip>
  );
}

