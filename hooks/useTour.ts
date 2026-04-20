import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';

const STORAGE_KEY = 'rizzze_tour_home_completed';
const AUTO_START_DELAY_MS = 800;
const DISMISS_FADE_DURATION_MS = 300;

export interface UseTourReturn {
  /** Controls tour content visibility (drives enter/exit animations) */
  isVisible: boolean;
  /** Controls component mount — lags isVisible by DISMISS_FADE_DURATION_MS on close */
  displaying: boolean;
  /** 0-indexed current step (0–4) */
  currentStep: number;
  /** True if device has Reduce Motion enabled */
  reduceMotion: boolean;
  /** Advance to the next step */
  goToNext: () => void;
  /** Go back to the previous step */
  goToBack: () => void;
  /** Complete the tour: hide immediately, unmount after fade, persist to storage */
  dismiss: () => void;
  /** Clear the completion flag and re-open immediately (no 600ms delay) */
  replay: () => void;
}

export function useTour(): UseTourReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [displaying, setDisplaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const isReduced = await AccessibilityInfo.isReduceMotionEnabled();
      if (!cancelled) setReduceMotion(isReduced);

      const completed = await AsyncStorage.getItem(STORAGE_KEY);
      if (completed === 'true' || cancelled) return;

      startTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          setDisplaying(true);
          setIsVisible(true);
        }
      }, AUTO_START_DELAY_MS);
    };

    init();

    return () => {
      cancelled = true;
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const goToBack = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const dismiss = useCallback(async () => {
    setIsVisible(false);
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    dismissTimerRef.current = setTimeout(() => {
      setDisplaying(false);
      setCurrentStep(0);
    }, DISMISS_FADE_DURATION_MS);
  }, []);

  const replay = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setDisplaying(true);
    setIsVisible(true);
  }, []);

  return { isVisible, displaying, currentStep, reduceMotion, goToNext, goToBack, dismiss, replay };
}
