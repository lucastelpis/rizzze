import React, { createContext, useContext } from 'react';
import { useTour, UseTourReturn } from '@/hooks/useTour';

const TourContext = createContext<UseTourReturn | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const tour = useTour();
  return <TourContext.Provider value={tour}>{children}</TourContext.Provider>;
}

export function useTourContext(): UseTourReturn {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTourContext must be used within TourProvider');
  return ctx;
}
