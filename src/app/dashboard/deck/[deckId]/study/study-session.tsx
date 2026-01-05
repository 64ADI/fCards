"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  X,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function StudySession({ deckId, deckName, cards }: StudySessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
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
    setCompletedCards(prev => new Set(prev).add(currentCard.id));
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
    setShowCompletion(false);
  };

  const handleExit = () => {
    router.push(`/dashboard/deck/${deckId}`);
  };

  if (showCompletion) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card className="p-12 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <Trophy className="h-24 w-24 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Session Complete! 🎉</h1>
          <p className="text-xl text-muted-foreground mb-2">
            You've reviewed all cards in this deck
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Cards marked as known: <span className="font-semibold text-primary">{completedCards.size}</span> / {cards.length}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleReset} size="lg" className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Study Again
            </Button>
            <Button onClick={handleExit} variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Deck
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExit}
            title="Exit study session"
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{deckName}</h1>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
          title="Restart session"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
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
              "absolute inset-0 backface-hidden shadow-2xl flex items-center justify-center p-12 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2",
              !isFlipped && "border-blue-300 dark:border-blue-700"
            )}
          >
            <div className="text-center w-full">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">
                Question
              </p>
              <p className="text-3xl font-semibold leading-relaxed break-words">
                {currentCard.front}
              </p>
              <p className="text-sm text-muted-foreground mt-8 italic">
                Click to reveal answer
              </p>
            </div>
          </Card>

          {/* Back of card */}
          <Card 
            className={cn(
              "absolute inset-0 backface-hidden shadow-2xl flex items-center justify-center p-12 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 rotate-y-180",
              isFlipped && "border-green-300 dark:border-green-700"
            )}
          >
            <div className="text-center w-full">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-4 uppercase tracking-wide">
                Answer
              </p>
              <p className="text-3xl font-semibold leading-relaxed break-words">
                {currentCard.back}
              </p>
              <p className="text-sm text-muted-foreground mt-8 italic">
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

        {isFlipped && (
          <Button
            variant="default"
            size="lg"
            onClick={handleMarkKnown}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-5 w-5" />
            I Know This
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          className="gap-2"
        >
          {currentIndex === cards.length - 1 ? 'Finish' : 'Next'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Card Status Indicators */}
      <div className="mt-8 flex justify-center gap-2 flex-wrap">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsFlipped(false);
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              index === currentIndex 
                ? "bg-primary text-primary-foreground scale-110 ring-2 ring-primary ring-offset-2" 
                : completedCards.has(card.id)
                ? "bg-green-500 text-white hover:scale-105"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
            )}
            title={`Card ${index + 1}${completedCards.has(card.id) ? ' (Known)' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

