"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp,
  Shuffle, 
  X,
  CheckCircle2,
  XCircle,
  Trophy,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startStudySessionAction } from '@/app/actions/study-session-actions';

interface StudyCard {
  id: number;
  front: string;
  back: string;
}

interface StudySessionProps {
  deckId: number;
  deckName: string;
  cards: StudyCard[];
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudySession({ deckId, deckName, cards }: StudySessionProps) {
  const router = useRouter();
  const [shuffledCards, setShuffledCards] = useState<StudyCard[]>(() => shuffleArray(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [incorrectAnswers, setIncorrectAnswers] = useState<Set<number>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const hasMarkedUnanswered = useRef(false);
  const sessionRecorded = useRef(false);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowCompletion(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkKnown = () => {
    setCorrectAnswers(prev => new Set(prev).add(currentCard.id));
    setIncorrectAnswers(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });
    handleNext();
  };

  const handleMarkUnknown = () => {
    setIncorrectAnswers(prev => new Set(prev).add(currentCard.id));
    setCorrectAnswers(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });
    handleNext();
  };

  const handleShuffle = async () => {
    // Record a new study session when user clicks "Shuffle & Study Again"
    const result = await startStudySessionAction(deckId);
    
    if (!result.success) {
      // If limit reached, redirect to deck page
      router.push(`/dashboard/deck/${deckId}`);
      return;
    }
    
    // Dispatch event to update the counter
    window.dispatchEvent(new CustomEvent('study-session-recorded'));
    
    const newShuffled = shuffleArray(cards);
    setShuffledCards(newShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectAnswers(new Set());
    setIncorrectAnswers(new Set());
    setShowCompletion(false);
    hasMarkedUnanswered.current = false;
  };

  const handleExit = () => {
    router.push(`/dashboard/deck/${deckId}`);
  };

  // Record study session when component mounts
  useEffect(() => {
    if (!sessionRecorded.current) {
      startStudySessionAction(deckId).then(() => {
        // Dispatch event to update the counter
        window.dispatchEvent(new CustomEvent('study-session-recorded'));
      }).catch(console.error);
      sessionRecorded.current = true;
    }
  }, [deckId]);

  // Check if keyboard shortcuts dialog should be shown
  useEffect(() => {
    const dontShow = localStorage.getItem('study-session-hide-keyboard-shortcuts');
    if (!dontShow) {
      setShowKeyboardShortcuts(true);
    }
  }, []);

  const handleCloseKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(false);
    if (dontShowAgain) {
      localStorage.setItem('study-session-hide-keyboard-shortcuts', 'true');
    }
  };

  // Mark unanswered questions as incorrect when session completes
  useEffect(() => {
    if (showCompletion && !hasMarkedUnanswered.current) {
      const answeredCardIds = new Set([
        ...correctAnswers,
        ...incorrectAnswers
      ]);
      
      // Find unanswered cards
      const unansweredCardIds = shuffledCards
        .filter(card => !answeredCardIds.has(card.id))
        .map(card => card.id);
      
      // Mark unanswered cards as incorrect
      if (unansweredCardIds.length > 0) {
        setIncorrectAnswers(prev => {
          const newSet = new Set(prev);
          unansweredCardIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
      
      hasMarkedUnanswered.current = true;
    } else if (!showCompletion) {
      // Reset the flag when session is reset
      hasMarkedUnanswered.current = false;
    }
  }, [showCompletion, shuffledCards, correctAnswers, incorrectAnswers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!showCompletion) {
            handleFlip();
          }
          break;
        case ' ':
          e.preventDefault();
          if (!showCompletion) {
            handleShuffle();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrevious, handleFlip, handleShuffle, showCompletion]);

  // Calculate results
  const correctCount = correctAnswers.size;
  const incorrectCount = incorrectAnswers.size;
  const totalCards = shuffledCards.length;
  const percentage = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;
  const passed = percentage >= 70; // 70% is passing grade

  return (
    <>
      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={(open) => {
        if (!open) {
          handleCloseKeyboardShortcuts();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Quick navigation tips
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Next card</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                →
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Previous card</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                ←
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reveal answer</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                ↑
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Shuffle</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                Space
              </kbd>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="dont-show-again" className="text-sm font-normal cursor-pointer">
              Don't show again
            </Label>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleCloseKeyboardShortcuts} size="sm">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showCompletion ? (
        <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card className="p-12 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <Trophy className={cn(
              "h-24 w-24",
              passed ? "text-yellow-500" : "text-gray-400"
            )} />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Session Complete! {passed ? '🎉' : '📚'}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {passed ? 'Congratulations! You passed!' : 'Keep practicing to improve!'}
          </p>
          
          {/* Results Stats */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {correctCount}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Incorrect</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {incorrectCount}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Score</p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {percentage}%
              </p>
            </div>
            
            <div className={cn(
              "p-4 rounded-lg border",
              passed 
                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
            )}>
              <p className="text-sm mb-1">
                {passed ? "Status: Passed ✅" : "Status: Not Passed ❌"}
              </p>
              <p className="text-lg font-semibold">
                {passed ? "Great job!" : `Need ${70 - percentage}% more to pass`}
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleShuffle} size="lg" className="gap-2">
              <Shuffle className="h-5 w-5" />
              Shuffle & Study Again
            </Button>
            <Button onClick={handleExit} variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Deck
            </Button>
          </div>
        </Card>
      </div>
      ) : (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExit}
            title="Exit study session"
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold break-words line-clamp-2">{deckName}</h1>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {shuffledCards.length}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleShuffle}
          className="gap-2 flex-shrink-0"
          title="Shuffle cards"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8 perspective-1000">
        <div
          className={cn(
            "relative w-full h-[400px] transition-transform duration-500 cursor-pointer preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <Card 
            className={cn(
              "absolute inset-0 backface-hidden shadow-2xl flex flex-col p-12 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 overflow-hidden",
              !isFlipped && "border-blue-300 dark:border-blue-700"
            )}
          >
            <div className="text-center w-full flex flex-col h-full min-h-0">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide flex-shrink-0">
                Question
              </p>
              <div className="flex-1 min-h-0 overflow-y-auto px-2">
                <p className="text-3xl font-semibold leading-relaxed break-words whitespace-pre-wrap">
                  {currentCard.front}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic flex-shrink-0">
                Click to reveal answer
              </p>
            </div>
          </Card>

          {/* Back of card */}
          <Card 
            className={cn(
              "absolute inset-0 backface-hidden shadow-2xl flex flex-col p-12 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 rotate-y-180 overflow-hidden",
              isFlipped && "border-green-300 dark:border-green-700"
            )}
          >
            <div className="text-center w-full flex flex-col h-full min-h-0">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-4 uppercase tracking-wide flex-shrink-0">
                Answer
              </p>
              <div className="flex-1 min-h-0 overflow-y-auto px-2">
                <p className="text-3xl font-semibold leading-relaxed break-words whitespace-pre-wrap">
                  {currentCard.back}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic flex-shrink-0">
                Click to flip back
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Previous
        </Button>

        {isFlipped ? (
          <div className="flex gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={handleMarkKnown}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-5 w-5" />
              I Know This
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleMarkUnknown}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-5 w-5" />
              I Don't Know This
            </Button>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {!isFlipped && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            className="gap-2"
          >
            {currentIndex === shuffledCards.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Card Status Indicators */}
      <div className="mt-8 flex justify-center gap-2 flex-wrap">
        {shuffledCards.map((card, index) => {
          const isCorrect = correctAnswers.has(card.id);
          const isIncorrect = incorrectAnswers.has(card.id);
          
          return (
            <button
              key={card.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                index === currentIndex 
                  ? "bg-primary text-primary-foreground scale-110 ring-2 ring-primary ring-offset-2" 
                  : isCorrect
                  ? "bg-green-500 text-white hover:scale-105"
                  : isIncorrect
                  ? "bg-red-500 text-white hover:scale-105"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
              )}
              title={`Card ${index + 1}${isCorrect ? ' (Correct)' : isIncorrect ? ' (Incorrect)' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      </div>
      )}
    </>
  );
}



