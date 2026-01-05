"use client";

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateDeckAction } from '@/app/actions/deck-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: {
    id: number;
    name: string;
    description: string;
  };
}

export function EditDeckDialog({ open, onOpenChange, deck }: EditDeckDialogProps) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateDeckAction({
          deckId: deck.id,
          name,
          description,
        });
        onOpenChange(false);
        toast.success('Deck updated successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update deck';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update your deck&apos;s name and description
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Indonesian Language"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this deck about?"
                className="min-h-[80px] resize-none"
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

