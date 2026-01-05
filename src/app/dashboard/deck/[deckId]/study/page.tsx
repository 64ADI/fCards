import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getDeckWithCards } from '@/db/queries/deck-queries';
import { getTodayStudySessionCount } from '@/db/queries/study-session-queries';
import { StudySession } from './study-session';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudySessionCounter } from '@/components/study-session-counter';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

const DAILY_STUDY_SESSION_LIMIT = 40;

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId, has } = await auth();
  
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

  if (deck.cards.length === 0) {
    redirect(`/dashboard/deck/${deckIdNumber}`);
  }

  // Check if user has unlimited study sessions feature
  const hasUnlimited = has({ feature: 'unlimited_study_sessions' });
  
  // Get today's count and calculate remaining for free users
  let todayCount = 0;
  let remainingSessions = 0;
  
  if (!hasUnlimited) {
    todayCount = await getTodayStudySessionCount(userId);
    
    if (todayCount >= DAILY_STUDY_SESSION_LIMIT) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Daily Study Session Limit Reached</h1>
            <p className="text-muted-foreground mb-4">
              You've completed {todayCount} study sessions today. The free plan allows up to {DAILY_STUDY_SESSION_LIMIT} study sessions per day.
            </p>
            <p className="text-muted-foreground mb-6">
              Upgrade to Pro for unlimited study sessions!
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/deck/${deckIdNumber}`}>Back to Deck</Link>
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    // Calculate remaining sessions (accounting for the current session that will be recorded)
    // Subtract 1 because this session will be recorded when StudySession mounts
    remainingSessions = Math.max(0, DAILY_STUDY_SESSION_LIMIT - todayCount - 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {!hasUnlimited && (
        <div className="container mx-auto pt-6 px-4 max-w-4xl">
          <StudySessionCounter 
            remaining={remainingSessions} 
            limit={DAILY_STUDY_SESSION_LIMIT}
            className="mb-3"
            autoRefresh={true}
          />
        </div>
      )}
      <StudySession 
        deckId={deck.id}
        deckName={deck.name}
        cards={deck.cards}
      />
    </div>
  );
}



