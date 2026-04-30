import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useUserPreferences } from '@/hooks/onboarding/useUserPreferences';
import { logger } from '@/utils/logger';
import {
  OnboardingContext,
  type OnboardingContextValue,
} from '@/contexts/OnboardingContext';
import type { TourName } from './tours/types';
import { TourGuide } from './TourGuide';

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuthContext();
  const userId = user?.id ?? null;
  const { prefs, loading, save, reload } = useUserPreferences(userId);

  const [currentTour, setCurrentTour] = useState<TourName | null>(null);
  const stoppedRef = useRef<boolean>(false);

  const prefsLoaded = !!userId && !loading;

  const startTour = useCallback(
    (name: TourName) => {
      if (!prefsLoaded) {
        logger.info('[onboarding] startTour ignored: prefs not loaded', name);
        return;
      }
      setCurrentTour((prev) => {
        if (prev !== null) {
          logger.info('[onboarding] startTour ignored: another tour active', { prev, name });
          return prev;
        }
        return name;
      });
    },
    [prefsLoaded],
  );

  const forceStartTour = useCallback(
    (name: TourName) => {
      // Recharge les prefs avant de lancer (utile depuis les Réglages)
      void reload().finally(() => {
        setCurrentTour((prev) => (prev === null ? name : prev));
      });
    },
    [reload],
  );

  const stopTour = useCallback(() => {
    setCurrentTour(null);
  }, []);

  const markTourCompleted = useCallback(
    async (name: TourName) => {
      const next = Array.from(new Set<TourName>([...prefs.completedTours, name]));
      await save({ completedTours: next });
    },
    [prefs.completedTours, save],
  );

  const resetTours = useCallback(async () => {
    setCurrentTour(null);
    await save({ completedTours: [], onboardingSkipped: false });
  }, [save]);

  // Cleanup au démontage du provider
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      setCurrentTour(null);
    };
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      prefsLoaded,
      isOnboardingActive: currentTour !== null,
      currentTour,
      completedTours: prefs.completedTours,
      startTour,
      forceStartTour,
      stopTour,
      markTourCompleted,
      resetTours,
    }),
    [
      prefsLoaded,
      currentTour,
      prefs.completedTours,
      startTour,
      forceStartTour,
      stopTour,
      markTourCompleted,
      resetTours,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <TourGuide />
    </OnboardingContext.Provider>
  );
}
