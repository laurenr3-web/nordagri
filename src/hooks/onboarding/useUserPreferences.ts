import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { isTourName, type TourName } from '@/components/onboarding/tours/types';

export interface OnboardingPrefs {
  completedTours: TourName[];
  onboardingSkipped: boolean;
}

const DEFAULT_PREFS: OnboardingPrefs = {
  completedTours: [],
  onboardingSkipped: false,
};

const STORAGE_KEY_PREFIX = 'nordagri_onboarding_v1_';

const parseTours = (raw: unknown): TourName[] => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<TourName>();
  for (const item of raw) {
    if (isTourName(item)) seen.add(item);
  }
  return Array.from(seen);
};

const readLocalStorage = (userId: string): OnboardingPrefs | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    return {
      completedTours: parseTours(obj.completedTours),
      onboardingSkipped: obj.onboardingSkipped === true,
    };
  } catch (err) {
    logger.error('[onboarding] localStorage read failed', err);
    return null;
  }
};

const writeLocalStorage = (userId: string, prefs: OnboardingPrefs): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(prefs));
  } catch (err) {
    logger.error('[onboarding] localStorage write failed', err);
  }
};

export interface UseUserPreferencesResult {
  prefs: OnboardingPrefs;
  loading: boolean;
  save: (partial: Partial<OnboardingPrefs>) => Promise<void>;
  reload: () => Promise<void>;
}

export function useUserPreferences(userId: string | null | undefined): UseUserPreferencesResult {
  const [prefs, setPrefs] = useState<OnboardingPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState<boolean>(true);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPrefs = useCallback(async (): Promise<OnboardingPrefs> => {
    if (!userId) return DEFAULT_PREFS;
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('completed_tours, onboarding_skipped')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('[onboarding] supabase select failed, falling back to localStorage', error);
        return readLocalStorage(userId) ?? DEFAULT_PREFS;
      }

      if (!data) {
        // Pas encore de ligne : on tente le localStorage en secours
        return readLocalStorage(userId) ?? DEFAULT_PREFS;
      }

      const next: OnboardingPrefs = {
        completedTours: parseTours(data.completed_tours),
        onboardingSkipped: data.onboarding_skipped === true,
      };
      writeLocalStorage(userId, next);
      return next;
    } catch (err) {
      logger.error('[onboarding] unexpected fetch error', err);
      return readLocalStorage(userId) ?? DEFAULT_PREFS;
    }
  }, [userId]);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    const next = await fetchPrefs();
    if (!mountedRef.current) return;
    setPrefs(next);
    setLoading(false);
  }, [fetchPrefs]);

  useEffect(() => {
    if (!userId) {
      setPrefs(DEFAULT_PREFS);
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchPrefs().then((next) => {
      if (!mountedRef.current) return;
      setPrefs(next);
      setLoading(false);
    });
  }, [userId, fetchPrefs]);

  const save = useCallback(
    async (partial: Partial<OnboardingPrefs>): Promise<void> => {
      if (!userId) return;
      const next: OnboardingPrefs = {
        completedTours: partial.completedTours ?? prefs.completedTours,
        onboardingSkipped: partial.onboardingSkipped ?? prefs.onboardingSkipped,
      };
      // Optimistic state update
      if (mountedRef.current) setPrefs(next);
      writeLocalStorage(userId, next);

      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert(
            {
              user_id: userId,
              completed_tours: next.completedTours,
              onboarding_skipped: next.onboardingSkipped,
            },
            { onConflict: 'user_id' },
          );
        if (error) {
          logger.error('[onboarding] supabase upsert failed (kept localStorage)', error);
        }
      } catch (err) {
        logger.error('[onboarding] unexpected upsert error', err);
      }
    },
    [userId, prefs.completedTours, prefs.onboardingSkipped],
  );

  return { prefs, loading, save, reload };
}
