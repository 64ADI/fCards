"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Play } from 'lucide-react';
import { StudySessionCounter } from '@/components/study-session-counter';
import { EditDeckDialog } from './edit-deck-dialog';
import { DeleteDeckDialog } from './delete-deck-dialog';

interface DeckHeaderProps {
  deck: {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
  };
  cardCount: number;
  remainingSessions?: number;
  sessionLimit?: number;
}

export function DeckHeader({ deck, cardCount, remainingSessions, sessionLimit }: DeckHeaderProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleStartStudy = () => {
    router.push(`/dashboard/deck/${deck.id}/study`);
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-3xl mb-2 break-words line-clamp-2">{deck.name}</CardTitle>
              <CardDescription className="text-base break-words line-clamp-3">
                {deck.description || 'No description'}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditDialogOpen(true)}
                title="Edit deck"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete deck"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <svg 
                  className="w-5 h-5 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                </svg>
                <span className="font-semibold text-lg">
                  {cardCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  {cardCount === 1 ? 'card' : 'cards'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <span>Created {new Date(deck.createdAt).toLocaleDateString()}</span>
                {remainingSessions !== undefined && sessionLimit !== undefined && (
                  <span className="ml-3">
                    <StudySessionCounter 
                      remaining={remainingSessions} 
                      limit={sessionLimit}
                      autoRefresh
                      compact
                      className="px-2 py-1"
                    />
                  </span>
                )}
              </div>
            </div>
            <Button 
              size="lg"
              disabled={cardCount === 0}
              onClick={handleStartStudy}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start Study Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditDeckDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        deck={deck}
      />

      <DeleteDeckDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deckId={deck.id}
        deckName={deck.name}
      />
    </>
  );
}

