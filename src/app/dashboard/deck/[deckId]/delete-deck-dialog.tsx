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
import { deleteDeckAction } from '@/app/actions/deck-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: number;
  deckName: string;
}

export function DeleteDeckDialog({ open, onOpenChange, deckId, deckName }: DeleteDeckDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    
    startTransition(async () => {
      try {
        await deleteDeckAction(deckId);
        toast.success('Deck deleted successfully!');
        // The action will redirect to dashboard, so we don't need to close the dialog
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{deckName}</strong> and all its cards.
            This action cannot be undone.
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

