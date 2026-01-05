"use client";

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateCardAction } from '@/app/actions/card-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CardData {
  id: number;
  front: string;
  back: string;
  deckId: number;
}

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CardData;
}

export function EditCardDialog({ open, onOpenChange, card }: EditCardDialogProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateCardAction({
          cardId: card.id,
          deckId: card.deckId,
          front,
          back,
        });
        onOpenChange(false);
        toast.success('Card updated successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update card';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back of your flashcard
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="front">Front (Question)</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="e.g., What is the Indonesian word for 'dog'?"
                className="min-h-[80px] resize-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back (Answer)</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="e.g., Anjing"
                className="min-h-[80px] resize-none"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

