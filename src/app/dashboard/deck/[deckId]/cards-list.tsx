"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditCardDialog } from './edit-card-dialog';
import { DeleteCardDialog } from './delete-card-dialog';

interface CardData {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CardsListProps {
  cards: CardData[];
  deckId: number;
}

export function CardsList({ cards, deckId }: CardsListProps) {
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardData | null>(null);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id} className="relative group hover:shadow-md transition-all hover:border-primary/50 overflow-hidden">
            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setEditingCard(card)}
                title="Edit card"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setDeletingCard(card)}
                title="Delete card"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col max-h-[400px]">
              {/* Front Side */}
              <div className="mb-3 min-h-0 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Question</span>
                </div>
                <div className="text-sm leading-relaxed pl-3 max-h-[140px] overflow-y-auto break-words whitespace-pre-wrap">
                  {card.front}
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-2 flex-shrink-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed"></div>
                </div>
              </div>

              {/* Back Side */}
              <div className="min-h-0 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1.5 mt-5">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wide">Answer</span>
                </div>
                <div className="text-sm leading-relaxed pl-3 max-h-[140px] overflow-y-auto break-words whitespace-pre-wrap">
                  {card.back}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editingCard && (
        <EditCardDialog
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          card={editingCard}
        />
      )}

      {deletingCard && (
        <DeleteCardDialog
          open={!!deletingCard}
          onOpenChange={(open) => !open && setDeletingCard(null)}
          card={deletingCard}
        />
      )}
    </>
  );
}

