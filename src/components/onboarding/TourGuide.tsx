/**
 * Stub component for Message 1.
 * The full <Joyride>-powered implementation lands in Message 2.
 * Kept as an empty render to keep the provider tree stable.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Joyride, { CallBackProps, STATUS, type Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { logger } from '@/utils/logger';
import type { TourName } from './tours/types';
import { welcomeStepsDesktop, welcomeStepsMobile } from './tours/welcomeTour';

/**
 * Renvoie les steps pour un tour donné, en filtrant ceux dont
 * la cible n'est pas présente dans le DOM (sauf 'body' / center).
 */
function getStepsForTour(name: TourName, isMobile: boolean): Step[] {
  let candidates: Step[] = [];
  if (name === 'welcome') {
    candidates = isMobile ? welcomeStepsMobile : welcomeStepsDesktop;
  }
  // equipment / maintenance : implémentés dans le Message 3
  return candidates.filter((step) => {
    const t = step.target;
    if (typeof t !== 'string') return true;
    if (t === 'body') return true;
    return document.querySelector(t) !== null;
  });
}

function hasOpenRadixDialog(): boolean {
  return document.querySelector('[role="dialog"][data-state="open"]') !== null;
}

export function TourGuide() {
  const { currentTour, stopTour, markTourCompleted } = useOnboarding();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Tour effectivement actif (peut être différé si dialog ouvert)
  const [activeTour, setActiveTour] = useState<TourName | null>(null);
  const [run, setRun] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  // Cleanup observer on unmount + route change
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Reset différé si la route change pendant qu'on attend la fermeture d'un dialog
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [location.pathname]);

  // Synchronise l'activation du tour avec le contexte
  useEffect(() => {
    if (currentTour === null) {
      setActiveTour(null);
      setRun(false);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Un dialog Radix est ouvert : on diffère via MutationObserver
    if (hasOpenRadixDialog()) {
      logger.info('[onboarding] tour deferred: open dialog detected', currentTour);
      const observer = new MutationObserver(() => {
        if (!hasOpenRadixDialog()) {
          observer.disconnect();
          observerRef.current = null;
          setActiveTour(currentTour);
          setRun(true);
        }
      });
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state'],
        childList: true,
      });
      observerRef.current = observer;
      return;
    }

    setActiveTour(currentTour);
    setRun(true);
  }, [currentTour]);

  const steps = useMemo<Step[]>(() => {
    if (!activeTour) return [];
    return getStepsForTour(activeTour, isMobile);
  }, [activeTour, isMobile]);

  // Si le tour actif n'a aucune step valide (cibles absentes), on l'arrête proprement.
  useEffect(() => {
    if (activeTour && run && steps.length === 0) {
      logger.info('[onboarding] no valid steps for tour, skipping', activeTour);
      void markTourCompleted(activeTour).finally(() => stopTour());
    }
  }, [activeTour, run, steps.length, markTourCompleted, stopTour]);

  const handleCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finished = status === STATUS.FINISHED || status === STATUS.SKIPPED;
    if (finished && activeTour) {
      void markTourCompleted(activeTour);
      stopTour();
      return;
    }
    if (type === 'error:target_not_found' && activeTour) {
      logger.warn('[onboarding] target not found, ending tour', activeTour);
      stopTour();
    }
  };

  if (!activeTour || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={undefined as unknown as number /* let joyride manage */}
      continuous
      showProgress
      showSkipButton
      disableScrolling={false}
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        nextLabelWithProgress: 'Suivant ({step} / {steps})',
        open: 'Ouvrir',
        skip: 'Passer',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--card-foreground))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'hsl(var(--foreground) / 0.55)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.35)',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: 14,
          lineHeight: 1.5,
          padding: '8px 0 0',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: 8,
          fontSize: 14,
          padding: '8px 14px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 14,
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 13,
        },
        buttonClose: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
    />
  );
}
