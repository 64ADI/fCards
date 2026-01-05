"use client";

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRemainingStudySessionsAction } from '@/app/actions/study-session-actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StudySessionResetCountdown } from '@/components/study-session-reset-countdown';

interface StudySessionCounterProps {
  remaining?: number; // Optional initial value
  limit?: number; // Optional initial value
  className?: string;
  compact?: boolean;
  autoRefresh?: boolean; // If true, will fetch and update automatically
}

export function StudySessionCounter({ 
  remaining: initialRemaining, 
  limit: initialLimit, 
  className, 
  compact = false,
  autoRefresh = false 
}: StudySessionCounterProps) {
  const [remaining, setRemaining] = useState<number | null>(initialRemaining ?? null);
  const [limit, setLimit] = useState<number | null>(initialLimit ?? null);

  // Fetch current count if autoRefresh is enabled or if no initial values provided
  useEffect(() => {
    if (autoRefresh || initialRemaining === undefined || initialLimit === undefined) {
      const fetchCount = async () => {
        const result = await getRemainingStudySessionsAction();
        if (result.remaining !== null && result.limit !== null) {
          setRemaining(result.remaining);
          setLimit(result.limit);
        } else {
          setRemaining(null);
          setLimit(null);
        }
      };
      fetchCount();
    }
  }, [autoRefresh, initialRemaining, initialLimit]);

  // Listen for custom event to refresh counter
  useEffect(() => {
    const handleRefresh = () => {
      // After a session is recorded, show the actual remaining count
      // (don't subtract 1 because the session has already been recorded)
      getRemainingStudySessionsAction(false).then(result => {
        if (result.remaining !== null && result.limit !== null) {
          setRemaining(result.remaining);
          setLimit(result.limit);
        }
      });
    };

    window.addEventListener('study-session-recorded', handleRefresh);
    return () => {
      window.removeEventListener('study-session-recorded', handleRefresh);
    };
  }, []);

  // Don't render if unlimited (null values)
  if (remaining === null || limit === null) {
    return null;
  }

  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 5;
  const isWarning = remaining <= 10;

  if (compact) {
    const counterContent = (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", 
        isLow ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" : 
        isWarning ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800" : 
        "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        className
      )}>
        <BookOpen className={cn(
          "h-3.5 w-3.5",
          isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
        )} />
        <span className={cn(
          "text-xs font-medium whitespace-nowrap",
          isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
        )}>
          {remaining} / {limit} sessions
        </span>
      </div>
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          {counterContent}
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          className="px-2 py-1.5 text-center w-auto"
          sideOffset={4}
          align="center"
        >
          <StudySessionResetCountdown />
        </PopoverContent>
      </Popover>
    );
  }

  const counterContent = (
    <div className={cn("p-2.5 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-blue-800", className)}>
      <div className="flex items-center gap-2.5">
        <BookOpen className={cn(
          "h-3.5 w-3.5 flex-shrink-0",
          isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isLow ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
              />
            </div>
            <span className={cn(
              "text-xs font-semibold whitespace-nowrap",
              isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
            )}>
              {remaining} / {limit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {counterContent}
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="px-2 py-1.5 text-center w-auto p-2"
        sideOffset={4}
        align="center"
      >
        <StudySessionResetCountdown />
      </PopoverContent>
    </Popover>
  );
}

