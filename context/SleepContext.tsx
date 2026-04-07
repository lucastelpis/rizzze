import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStreak } from './StreakContext';

export type SleepQuality = 'bad' | 'okay' | 'good' | 'great' | 'perfect' | null;
export type SleepEntry = {
  quality: SleepQuality;
  note?: string;
};

type SleepContextType = {
  sleepData: Record<string, SleepEntry>;
  hasRatedToday: boolean;
  rateSleep: (dateKey: string, quality: SleepQuality, note?: string) => Promise<void>;
  getQuality: (dateKey: string) => SleepQuality;
  getNote: (dateKey: string) => string | undefined;
  hasSeenSuccessToday: boolean;
  markSuccessSeen: () => void;
  resetSleepData: () => Promise<void>;
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
  const [sleepData, setSleepData] = useState<Record<string, SleepEntry>>({});
  const [hasSeenSuccessToday, setHasSeenSuccessToday] = useState(false);
  const { markActivity, reportSleepRating } = useStreak();

  const normalizeData = (data: Record<string, any>): Record<string, SleepEntry> => {
    const normalized: Record<string, SleepEntry> = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (typeof val === 'string') {
        normalized[key] = { quality: val as SleepQuality };
      } else if (val && typeof val === 'object') {
        normalized[key] = val;
      }
    });
    return normalized;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) {
          const parsed = JSON.parse(val);
          const normalized = normalizeData(parsed);
          setSleepData(normalized);
          // If already rated today at startup, consider it "seen"
          if (normalized[getDateKey()]) {
            setHasSeenSuccessToday(true);
          }
        }
      } catch (e) {
        console.error('Failed to load sleep data', e);
      }
    };
    loadData();
  }, []);

  const rateSleep = async (dateKey: string, quality: SleepQuality, note?: string) => {
    const currentEntry = sleepData[dateKey] || {};
    const newEntry: SleepEntry = { 
      quality: quality !== undefined ? quality : currentEntry.quality, 
      note: note !== undefined ? note : currentEntry.note 
    };
    
    const newData = { ...sleepData, [dateKey]: newEntry };
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
    return sleepData[dateKey]?.quality || null;
  };

  const getNote = (dateKey: string) => {
    return sleepData[dateKey]?.note;
  };

  const markSuccessSeen = () => setHasSeenSuccessToday(true);
  
  const resetSleepData = async () => {
    setSleepData({});
    setHasSeenSuccessToday(false);
  };

  const hasRatedToday = !!sleepData[getDateKey()];

  return (
    <SleepContext.Provider
      value={{
        sleepData,
        hasRatedToday,
        rateSleep,
        getQuality,
        getNote,
        hasSeenSuccessToday,
        markSuccessSeen,
        resetSleepData,
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
