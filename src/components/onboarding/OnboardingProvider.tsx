import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { useFarmId } from '@/hooks/useFarmId';
import { withPreviewToken } from '@/utils/previewRouting';
import { ONBOARDING_STEPS, type OnboardingStepId } from './steps';
import { OnboardingOverlay } from './OnboardingOverlay';
import { OnboardingChecklist } from './OnboardingChecklist';

interface OnboardingContextValue {
  isActive: boolean;
  currentIndex: number;
  completedIds: OnboardingStepId[];
  start: (opts?: { force?: boolean }) => void;
  next: () => void;
  skip: () => void;
  complete: () => void;
  markStepDone: (id: OnboardingStepId) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const LS_KEY = 'nordagri.onboarding.seen';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const { farmId } = useFarmId();
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<OnboardingStepId[]>([]);
  const checkedRef = useRef(false);

  // Auto-trigger on first login
  useEffect(() => {
    if (!user || !farmId || checkedRef.current) return;
    checkedRef.current = true;
    const localSeen = typeof window !== 'undefined' && localStorage.getItem(LS_KEY) === '1';
    if (localSeen) return;

    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('has_seen_onboarding')
        .eq('id', user.id)
        .maybeSingle();
      const seen = (data as { has_seen_onboarding?: boolean } | null)?.has_seen_onboarding;
      if (seen) {
        try { localStorage.setItem(LS_KEY, '1'); } catch {}
        return;
      }
      setCurrentIndex(0);
      setCompletedIds([]);
      setIsActive(true);
      navigate(withPreviewToken(ONBOARDING_STEPS[0].route));
    })();
  }, [user, farmId, navigate]);

  const persistSeen = useCallback(async (seen: boolean) => {
    if (!user) return;
    try {
      if (seen) localStorage.setItem(LS_KEY, '1');
      else localStorage.removeItem(LS_KEY);
    } catch {}
    await supabase
      .from('profiles')
      .update({ has_seen_onboarding: seen })
      .eq('id', user.id);
  }, [user]);

  const start = useCallback(
    (opts?: { force?: boolean }) => {
      setCurrentIndex(0);
      setCompletedIds([]);
      setIsActive(true);
      if (opts?.force) {
        void persistSeen(false);
      }
      navigate(withPreviewToken(ONBOARDING_STEPS[0].route));
    },
    [navigate, persistSeen],
  );

  const complete = useCallback(() => {
    setIsActive(false);
    setCompletedIds(ONBOARDING_STEPS.map((s) => s.id));
    void persistSeen(true);
  }, [persistSeen]);

  const skip = useCallback(() => {
    setIsActive(false);
    void persistSeen(true);
  }, [persistSeen]);

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      const nextIdx = i + 1;
      if (nextIdx >= ONBOARDING_STEPS.length) {
        setIsActive(false);
        void persistSeen(true);
        setCompletedIds(ONBOARDING_STEPS.map((s) => s.id));
        return i;
      }
      const nextStep = ONBOARDING_STEPS[nextIdx];
      // navigate if needed
      if (!location.pathname.startsWith(nextStep.route)) {
        navigate(withPreviewToken(nextStep.route));
      }
      return nextIdx;
    });
  }, [location.pathname, navigate, persistSeen]);

  const markStepDone = useCallback(
    (id: OnboardingStepId) => {
      if (!isActive) return;
      setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const stepIdx = ONBOARDING_STEPS.findIndex((s) => s.id === id);
      if (stepIdx === currentIndex) {
        // auto-advance after a short delay so the user can see the action took effect
        window.setTimeout(() => next(), 600);
      }
    },
    [isActive, currentIndex, next],
  );

  const value = useMemo<OnboardingContextValue>(
    () => ({ isActive, currentIndex, completedIds, start, next, skip, complete, markStepDone }),
    [isActive, currentIndex, completedIds, start, next, skip, complete, markStepDone],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {isActive && <OnboardingOverlay />}
      {isActive && <OnboardingChecklist />}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  // Return a no-op fallback when used outside the provider so consumers
  // (e.g. settings rendered in isolation) don't crash.
  if (!ctx) {
    return {
      isActive: false,
      currentIndex: 0,
      completedIds: [],
      start: () => {},
      next: () => {},
      skip: () => {},
      complete: () => {},
      markStepDone: () => {},
    } as OnboardingContextValue;
  }
  return ctx;
}

export function useOnboardingTarget(id: OnboardingStepId) {
  // Helper for consumers to mark a step done when the user performs the action.
  const ctx = useContext(OnboardingContext);
  return useCallback(() => ctx?.markStepDone(id), [ctx, id]);
}