"use client";

import { useEffect, useState } from "react";

/**
 * Calculates the time until the next UTC midnight (when study session counter resets)
 * Returns time in hours:minutes:seconds format
 */
export function StudySessionResetCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      // Get today's midnight UTC
      const todayMidnight = new Date(now);
      todayMidnight.setUTCHours(0, 0, 0, 0);
      
      // Calculate next midnight UTC
      const nextMidnight = new Date(todayMidnight);
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      
      // Calculate difference in milliseconds
      const diff = nextMidnight.getTime() - now.getTime();
      
      // Ensure non-negative (shouldn't happen, but safety check)
      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format as HH:MM:SS
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      setTimeRemaining(formatted);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeRemaining) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="font-mono text-xs font-semibold">{timeRemaining}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">until reset</div>
    </div>
  );
}

