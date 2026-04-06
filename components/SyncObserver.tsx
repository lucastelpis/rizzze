import React, { useEffect, useRef } from 'react';
import { useBackup } from '@/hooks/useBackup';
import { useUser } from '@/context/UserContext';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { useStreak } from '@/context/StreakContext';
import { useSleep } from '@/context/SleepContext';

export function SyncObserver() {
  const { performBackup, isEmailVerified } = useBackup();
  const { name, goal, ageRange, gender } = useUser();
  const { totalPoints } = useSheepGrowth();
  const { streakCount } = useStreak();
  const { sleepData } = useSleep();
  
  const isFirstRender = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // We only auto-sync if the user has verified their email (enabled Cloud Sync)
    if (!isEmailVerified) return;

    // Skip the very first render (loading state)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Debounce the backup to avoid spamming Supabase if multiple states change fast
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performBackup(true); // Silent backup
    }, 3000) as unknown as NodeJS.Timeout; // Cast to resolve type conflict

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    isEmailVerified, 
    name, 
    goal, 
    ageRange, 
    gender, 
    totalPoints, 
    streakCount, 
    Object.keys(sleepData).length // Monitor number of ratings
  ]);

  return null; // This component doesn't render anything
}
