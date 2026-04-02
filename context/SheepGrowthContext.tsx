import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SHEEP_STAGES,
  RECHARGE_DURATION_MS,
  POINTS_DAILY_RATING,
  POINTS_STREAK_DAY,
  POINTS_PET,
  POINTS_FEED,
} from '@/constants/sheepGrowth';

// ─── STORAGE KEYS ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'rizzze_sheep_growth';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type PointBreakdown = {
  daily: number;
  streak: number;
  pet: number;
  feed: number;
};

type SheepGrowthData = {
  points: PointBreakdown;
  lastPetTime: number | null;   // timestamp ms
  lastFeedTime: number | null;  // timestamp ms
};

type SheepGrowthContextType = {
  totalPoints: number;
  pointBreakdown: PointBreakdown;
  currentStageIndex: number;
  currentStageName: string;
  progressToNextStage: number; // 0..1
  pointsInCurrentStage: number;
  pointsForNextStage: number;
  isMaxStage: boolean;
  petCooldownRemaining: number; // ms remaining, 0 if ready
  feedCooldownRemaining: number;
  canPet: boolean;
  canFeed: boolean;
  petSheep: () => void;
  feedSheep: () => void;
  addDailyRatingPoint: () => void;
  addStreakPoint: () => void;
  resetGrowthData: () => Promise<void>;
  evolutionReward: string | null;
  clearEvolutionReward: () => void;
};

const DEFAULT_DATA: SheepGrowthData = {
  points: { daily: 0, streak: 0, pet: 0, feed: 0 },
  lastPetTime: null,
  lastFeedTime: null,
};

const SheepGrowthContext = createContext<SheepGrowthContextType | null>(null);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getStageIndex(totalPoints: number): number {
  let stageIdx = 0;
  for (let i = SHEEP_STAGES.length - 1; i >= 0; i--) {
    if (totalPoints >= SHEEP_STAGES[i].pointsRequired) {
      stageIdx = i;
      break;
    }
  }
  return stageIdx;
}

function getCooldownRemaining(lastTime: number | null): number {
  if (lastTime === null) return 0;
  const elapsed = Date.now() - lastTime;
  const remaining = RECHARGE_DURATION_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

// ─── PROVIDER ────────────────────────────────────────────────────────────────
export function SheepGrowthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SheepGrowthData>(DEFAULT_DATA);
  const [cooldownTick, setCooldownTick] = useState(0);
  const [evolutionReward, setEvolutionReward] = useState<string | null>(null);
  const prevStageRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) {
          const parsed = JSON.parse(val);
          setData(parsed);
          // Initialize prevStageRef with the level from storage
          const totalPoints = parsed.points.daily + parsed.points.streak + parsed.points.pet + parsed.points.feed;
          prevStageRef.current = getStageIndex(totalPoints);
        }
      } catch (e) {
        console.error('Failed to load sheep growth data', e);
      }
    })();
  }, []);

  // Save helper
  const persist = useCallback(async (newData: SheepGrowthData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save sheep growth data', e);
    }
  }, []);

  // Tick cooldowns every 30s so timers update in UI
  useEffect(() => {
    const hasCooldown =
      getCooldownRemaining(data.lastPetTime) > 0 ||
      getCooldownRemaining(data.lastFeedTime) > 0;

    if (hasCooldown && !intervalRef.current) {
      intervalRef.current = setInterval(() => setCooldownTick(t => t + 1), 30000);
    } else if (!hasCooldown && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data.lastPetTime, data.lastFeedTime, cooldownTick]);

  // ── Actions ──
  const petSheep = useCallback(() => {
    setData(prev => {
      if (getCooldownRemaining(prev.lastPetTime) > 0) return prev;
      const newData = {
        ...prev,
        points: { ...prev.points, pet: prev.points.pet + POINTS_PET },
        lastPetTime: Date.now(),
      };
      persist(newData);
      return newData;
    });
  }, [persist]);

  const feedSheep = useCallback(() => {
    setData(prev => {
      if (getCooldownRemaining(prev.lastFeedTime) > 0) return prev;
      const newData = {
        ...prev,
        points: { ...prev.points, feed: prev.points.feed + POINTS_FEED },
        lastFeedTime: Date.now(),
      };
      persist(newData);
      return newData;
    });
  }, [persist]);

  const addDailyRatingPoint = useCallback(() => {
    setData(prev => {
      const newData = {
        ...prev,
        points: { ...prev.points, daily: prev.points.daily + POINTS_DAILY_RATING },
      };
      persist(newData);
      return newData;
    });
  }, [persist]);

  const addStreakPoint = useCallback(() => {
    setData(prev => {
      const newData = {
        ...prev,
        points: { ...prev.points, streak: prev.points.streak + POINTS_STREAK_DAY },
      };
      persist(newData);
      return newData;
    });
  }, [persist]);

  const resetGrowthData = async () => {
    setData(DEFAULT_DATA);
  };

  // ── Derived values ──
  const totalPoints = data.points.daily + data.points.streak + data.points.pet + data.points.feed;
  const currentStageIndex = getStageIndex(totalPoints);
  const currentStageName = SHEEP_STAGES[currentStageIndex].name;

  // Detect Evolution
  useEffect(() => {
    if (prevStageRef.current !== null && currentStageIndex > prevStageRef.current) {
      setEvolutionReward(currentStageName);
    }
    prevStageRef.current = currentStageIndex;
  }, [currentStageIndex, currentStageName]);

  const clearEvolutionReward = () => setEvolutionReward(null);

  const isMaxStage = currentStageIndex === SHEEP_STAGES.length - 1;

  let progressToNextStage = 1;
  let pointsInCurrentStage = 0;
  let pointsForNextStage = 0;

  if (!isMaxStage) {
    const currentThreshold = SHEEP_STAGES[currentStageIndex].pointsRequired;
    const nextThreshold = SHEEP_STAGES[currentStageIndex + 1].pointsRequired;
    pointsInCurrentStage = totalPoints - currentThreshold;
    pointsForNextStage = nextThreshold - currentThreshold;
    progressToNextStage = pointsInCurrentStage / pointsForNextStage;
  }

  const petCooldownRemaining = getCooldownRemaining(data.lastPetTime);
  const feedCooldownRemaining = getCooldownRemaining(data.lastFeedTime);

  return (
    <SheepGrowthContext.Provider
      value={{
        totalPoints,
        pointBreakdown: data.points,
        currentStageIndex,
        currentStageName,
        progressToNextStage,
        pointsInCurrentStage,
        pointsForNextStage,
        isMaxStage,
        petCooldownRemaining,
        feedCooldownRemaining,
        canPet: petCooldownRemaining === 0,
        canFeed: feedCooldownRemaining === 0,
        petSheep,
        feedSheep,
        addDailyRatingPoint,
        addStreakPoint,
        resetGrowthData,
        evolutionReward,
        clearEvolutionReward,
      }}
    >
      {children}
    </SheepGrowthContext.Provider>
  );
}

export const useSheepGrowth = () => {
  const ctx = useContext(SheepGrowthContext);
  if (!ctx) throw new Error('useSheepGrowth must be used within SheepGrowthProvider');
  return ctx;
};
