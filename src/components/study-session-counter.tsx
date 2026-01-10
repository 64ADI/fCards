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
  showLabelOnly?: boolean; // If true, render a compact inline label (e.g. "study sessions: {available}")
}

export function StudySessionCounter({ 
  remaining: initialRemaining, 
  limit: initialLimit, 
  className, 
  compact = false,
  autoRefresh = false,
  showLabelOnly = false
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

  // If asked to render a simple inline label, show that (or nothing for unlimited)
  if (showLabelOnly) {
    if (remaining === null || limit === null) {
      return null;
    }

    const isLow = remaining <= 5;
    const isWarning = remaining <= 10;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className={cn("text-sm font-medium", isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400")}>
            <strong className={cn("mr-1", isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400")}>study sessions:</strong>
            {remaining}
          </span>
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

  // Don't render if unlimited (null values)
  if (remaining === null || limit === null) {
    return null;
  }

  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 5;
  const isWarning = remaining <= 10;

  if (compact) {
    const counterContent = (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
          isLow
            ? "bg-red-50 dark:bg-red-950/20 text-red-700"
            : isWarning
            ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700"
            : "bg-blue-50 dark:bg-blue-950/20 text-blue-700",
          className
        )}
        title={`${remaining} / ${limit} study sessions remaining`}
      >
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            isLow ? "bg-red-600" : isWarning ? "bg-yellow-600" : "bg-blue-600"
          )}
          aria-hidden
        />

        <span className="whitespace-nowrap">{remaining} {remaining === 1 ? 'session' : 'sessions'}</span>
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
    <div className={cn("p-3 rounded-lg border bg-white dark:bg-gray-800 shadow-sm", className)}>
      <div className="flex items-center gap-4">
        <BookOpen className={cn(
          "h-5 w-5 flex-shrink-0",
          isLow ? "text-red-600 dark:text-red-400" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
        )} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-muted-foreground">Study sessions</div>
              <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isLow ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                />
              </div>
            </div>

            <div className={cn(
              "ml-2 px-3 py-1 rounded-full text-sm font-semibold",
              isLow ? "bg-red-600 text-white" : isWarning ? "bg-yellow-300 text-black dark:bg-yellow-600 dark:text-black" : "bg-blue-600 text-white"
            )}>
              {remaining}/{limit}
            </div>
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

