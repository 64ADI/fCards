import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getDeckWithCards } from '@/db/queries/deck-queries';
import { getTodayStudySessionCount } from '@/db/queries/study-session-queries';
import { DeckHeader } from './deck-header';
import { CardsList } from './cards-list';
import { AddCardButton } from './add-card-button';

const DAILY_STUDY_SESSION_LIMIT = 40;

interface DeckPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    notFound();
  }
  
  const deck = await getDeckWithCards(deckIdNumber, userId);
  
  if (!deck) {
    notFound();
  }

  // Get study session info for free users
  const { has } = await auth();
  const hasUnlimited = has({ feature: 'unlimited_study_sessions' });
  let remainingSessions: number | undefined = undefined;
  
  if (!hasUnlimited) {
    const todayCount = await getTodayStudySessionCount(userId);
    remainingSessions = Math.max(0, DAILY_STUDY_SESSION_LIMIT - todayCount);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Deck Header with title, description, and actions */}
      <DeckHeader 
        deck={{
          id: deck.id,
          name: deck.name,
          description: deck.description || '',
          createdAt: deck.createdAt,
        }}
        cardCount={deck.cards.length}
        remainingSessions={remainingSessions}
        sessionLimit={!hasUnlimited ? DAILY_STUDY_SESSION_LIMIT : undefined}
      />

      {/* Cards Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Flashcards</h2>
          <AddCardButton deckId={deck.id} />
        </div>

        {deck.cards.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">No cards yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by adding your first flashcard
            </p>
            <AddCardButton deckId={deck.id} />
          </div>
        ) : (
          <CardsList cards={deck.cards} deckId={deck.id} />
        )}
      </div>
    </div>
  );
}

