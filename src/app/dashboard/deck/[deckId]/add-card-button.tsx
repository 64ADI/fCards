"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { createCardAction } from '@/app/actions/card-actions';
import { toast } from 'sonner';

interface AddCardButtonProps {
  deckId: number;
}

export function AddCardButton({ deckId }: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createCardAction({
          deckId,
          front,
          back,
        });
        // Reset form and close dialog
        setFront('');
        setBack('');
        setOpen(false);
        // Show success toast
        toast.success('Card created successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create card';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck
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
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

