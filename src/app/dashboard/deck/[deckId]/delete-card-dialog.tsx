"use client";

import { useTransition, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteCardAction } from '@/app/actions/card-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CardData {
  id: number;
  front: string;
  deckId: number;
}

interface DeleteCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CardData;
}

export function DeleteCardDialog({ open, onOpenChange, card }: DeleteCardDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    
    startTransition(async () => {
      try {
        await deleteCardAction(card.id, card.deckId);
        onOpenChange(false);
        toast.success('Card deleted successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete card';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this flashcard. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

