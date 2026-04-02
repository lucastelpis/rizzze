import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStreak } from './StreakContext';

export type SleepQuality = 'bad' | 'okay' | 'good' | 'great' | 'perfect' | null;

type SleepContextType = {
  sleepData: Record<string, SleepQuality>;
  hasRatedToday: boolean;
  rateSleep: (dateKey: string, quality: SleepQuality) => Promise<void>;
  getQuality: (dateKey: string) => SleepQuality;
  hasSeenSuccessToday: boolean;
  markSuccessSeen: () => void;
};

const SleepContext = createContext<SleepContextType | null>(null);

const STORAGE_KEY = 'rizzze_sleep_data';

export const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

export function SleepProvider({ children }: { children: React.ReactNode }) {
  const [sleepData, setSleepData] = useState<Record<string, SleepQuality>>({});
  const [hasSeenSuccessToday, setHasSeenSuccessToday] = useState(false);
  const { markActivity, reportSleepRating } = useStreak();

  useEffect(() => {
    const loadData = async () => {
      try {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) {
          const parsed = JSON.parse(val);
          setSleepData(parsed);
          // If already rated today at startup, consider it "seen"
          if (parsed[getDateKey()]) {
            setHasSeenSuccessToday(true);
          }
        }
      } catch (e) {
        console.error('Failed to load sleep data', e);
      }
    };
    loadData();
  }, []);

  const rateSleep = async (dateKey: string, quality: SleepQuality) => {
    const newData = { ...sleepData, [dateKey]: quality };
    setSleepData(newData);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      if (quality !== null) {
        // Report to streak context
        reportSleepRating(dateKey);
        // Mark activity if it's today (for streak)
        if (dateKey === getDateKey()) {
          markActivity();
        }
      }
    } catch (e) {
      console.error('Failed to save sleep rating', e);
    }
  };

  const getQuality = (dateKey: string) => {
    return sleepData[dateKey] || null;
  };

  const markSuccessSeen = () => setHasSeenSuccessToday(true);

  const hasRatedToday = !!sleepData[getDateKey()];

  return (
    <SleepContext.Provider
      value={{
        sleepData,
        hasRatedToday,
        rateSleep,
        getQuality,
        hasSeenSuccessToday,
        markSuccessSeen,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
}

export const useSleep = () => {
  const ctx = useContext(SleepContext);
  if (!ctx) throw new Error('useSleep must be used within SleepProvider');
  return ctx;
};
