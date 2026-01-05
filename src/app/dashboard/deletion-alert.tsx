"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeletionAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const deleted = searchParams.get('deleted');
    if (deleted === 'true') {
      setShowAlert(true);
      // Remove the query parameter from URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('deleted');
      window.history.replaceState({}, '', url.toString());
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-top-5">
      <div className="bg-red-500 border border-red-600 rounded-lg shadow-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            Deck Successfully Deleted
          </p>
          <p className="text-sm text-red-100 mt-1">
            The deck has been permanently deleted.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white hover:bg-red-600 hover:text-white flex-shrink-0"
          onClick={() => setShowAlert(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

