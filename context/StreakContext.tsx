import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rizzze_streak_data';

type StreakContextType = {
  activeDates: string[];
  markActivity: () => void;
  streakCount: number;
  lastSevenDays: boolean[];
  todayIndex: number;
  sleepRatingCount: number;
  reportSleepRating: (dateKey: string) => void;
  syncSleepRatings: () => Promise<void>;
};

const StreakContext = createContext<StreakContextType | null>(null);

function getDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [ratedOnTimeDays, setRatedOnTimeDays] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) setActiveDates(JSON.parse(val));
        
        const ratedDaysVal = await AsyncStorage.getItem('rizzze_rated_on_time_days');
        if (ratedDaysVal) setRatedOnTimeDays(JSON.parse(ratedDaysVal));
      } catch (e) {
        console.error('Failed to load streak or rating data', e);
      }
    };
    loadData();
  }, []);

  const markActivity = async () => {
    const today = getDateKey();
    if (!activeDates.includes(today)) {
      const newDates = [...activeDates, today];
      setActiveDates(newDates);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDates));
      } catch (e) {
        console.error('Failed to save streak data', e);
      }
    }
  };

  const reportSleepRating = async (dateKey: string) => {
    const today = getDateKey();
    // Only count if it's today's date and not already in our list
    if (dateKey === today && !ratedOnTimeDays.includes(dateKey)) {
      const newRatedDays = [...ratedOnTimeDays, dateKey];
      setRatedOnTimeDays(newRatedDays);
      try {
        await AsyncStorage.setItem('rizzze_rated_on_time_days', JSON.stringify(newRatedDays));
      } catch (e) {
        console.error('Failed to save rated days', e);
      }
    }
  };

  const syncSleepRatings = async () => {
    try {
      const sleepDataVal = await AsyncStorage.getItem('rizzze_sleep_data');
      if (sleepDataVal) {
        const sleepData = JSON.parse(sleepDataVal);
        const today = getDateKey();
        
        // If today has a rating in the sleep data, but isn't in our "on time" list, add it
        if (sleepData[today] && !ratedOnTimeDays.includes(today)) {
          await reportSleepRating(today);
        }
      }
    } catch (e) {
      console.error('Failed to sync sleep ratings', e);
    }
  };

  const getStreakCount = () => {
    if (activeDates.length === 0) return 0;

    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hasToday = activeDates.includes(getDateKey(today));
    const hasYesterday = activeDates.includes(getDateKey(yesterday));

    if (!hasToday && !hasYesterday) return 0;

    let current = hasToday ? today : yesterday;
    count = 1;

    while (true) {
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 1);
      const prevKey = getDateKey(prev);
      if (activeDates.includes(prevKey)) {
        count++;
        current = prev;
      } else {
        break;
      }
    }

    return count;
  };

  const getWeekState = () => {
    // Current week: Mon to Sun
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const diffToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMon);
    monday.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(activeDates.includes(getDateKey(d)));
    }
    
    return {
      lastSevenDays: week,
      todayIndex: diffToMon,
    };
  };

  const { lastSevenDays, todayIndex } = getWeekState();

  return (
    <StreakContext.Provider
      value={{
        activeDates,
        markActivity,
        streakCount: getStreakCount(),
        lastSevenDays,
        todayIndex,
        sleepRatingCount: ratedOnTimeDays.length,
        reportSleepRating,
        syncSleepRatings,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}

export const useStreak = () => {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
};
