"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckLimitDisplayProps {
  currentCount: number;
  limit: number | null;
  hasUnlimited: boolean;
}

export function DeckLimitDisplay({ currentCount, limit, hasUnlimited }: DeckLimitDisplayProps) {
  // If user has unlimited decks, show a simple count
  if (hasUnlimited) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {currentCount} {currentCount === 1 ? "deck" : "decks"}
          </span>
          <span className="text-xs text-muted-foreground">Pro</span>
        </div>
      </div>
    );
  }

  // For free plan users, show limit with upgrade popover
  const isNearLimit = limit ? currentCount >= limit * 0.8 : false;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:shadow-md",
            isNearLimit
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
              : "bg-muted/50 border-border hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-2">
            <Crown
              className={cn(
                "h-4 w-4 transition-transform hover:scale-110",
                isNearLimit ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              )}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {currentCount}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{limit}</span>
              <span className="text-xs text-muted-foreground ml-0.5">decks</span>
            </div>
          </div>
          {isNearLimit && (
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 ml-1">
              Limit
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-2.5">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-sm">Upgrade to Pro</h4>
              <p className="text-xs text-muted-foreground">
                Unlock unlimited decks and AI-powered flashcard generation
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">Unlimited Decks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">Unlimited Study Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground">AI Flashcard Generation</span>
            </div>
          </div>

          <Link href="/pricing" className="block">
            <Button className="w-full" size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

