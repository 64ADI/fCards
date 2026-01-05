import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getDeckWithCards } from '@/db/queries/deck-queries';
import { StudySession } from './study-session';

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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

  if (deck.cards.length === 0) {
    redirect(`/dashboard/deck/${deckIdNumber}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <StudySession 
        deckId={deck.id}
        deckName={deck.name}
        cards={deck.cards}
      />
    </div>
  );
}



