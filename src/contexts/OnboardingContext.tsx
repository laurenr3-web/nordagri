import { createContext, useContext } from 'react';
import type { TourName } from '@/components/onboarding/tours/types';

export interface OnboardingContextValue {
  prefsLoaded: boolean;
  isOnboardingActive: boolean;
  currentTour: TourName | null;
  completedTours: TourName[];
  /** Refuse if a tour is already active OR prefs not loaded yet. */
  startTour: (name: TourName) => void;
  /** Manual entry point (Settings): reloads prefs then starts even if !prefsLoaded. */
  forceStartTour: (name: TourName) => void;
  stopTour: () => void;
  markTourCompleted: (name: TourName) => Promise<void>;
  resetTours: () => Promise<void>;
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
