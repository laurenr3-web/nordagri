import { useEffect, useMemo, useRef, useState } from 'react';
import { useJoyride, EVENTS, STATUS, type Step, type EventData } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { logger } from '@/utils/logger';
import type { TourName } from './tours/types';
import { welcomeStepsDesktop, welcomeStepsMobile } from './tours/welcomeTour';
import { equipmentStepsDesktop, equipmentStepsMobile } from './tours/equipmentTour';
import { maintenanceStepsDesktop, maintenanceStepsMobile } from './tours/maintenanceTour';

/**
 * Renvoie les steps pour un tour donné, en filtrant ceux dont
 * la cible n'est pas présente dans le DOM (sauf 'body' / center).
 */
function getStepsForTour(name: TourName, isMobile: boolean): Step[] {
  let candidates: Step[] = [];
  if (name === 'welcome') {
    candidates = isMobile ? welcomeStepsMobile : welcomeStepsDesktop;
  }
  if (name === 'equipment') {
    candidates = isMobile ? equipmentStepsMobile : equipmentStepsDesktop;
  }
  if (name === 'maintenance') {
    candidates = isMobile ? maintenanceStepsMobile : maintenanceStepsDesktop;
  }
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
  const observerRef = useRef<MutationObserver | null>(null);

  const steps = useMemo<Step[]>(() => {
    if (!activeTour) return [];
    return getStepsForTour(activeTour, isMobile);
  }, [activeTour, isMobile]);

  // Hook joyride — toujours monté tant que TourGuide est rendu
  const { controls, on, Tour } = useJoyride({
    steps,
    continuous: true,
    locale: {
      back: 'Précédent',
      close: 'Fermer',
      last: 'Terminer',
      next: 'Suivant',
      nextWithProgress: 'Suivant ({current}/{total})',
      open: 'Ouvrir',
      skip: 'Passer',
    },
    options: {
      showProgress: true,
      skipBeacon: true,
      disableFocusTrap: true,
      overlayClickAction: false,
      buttons: ['back', 'skip', 'primary'],
      primaryColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--card))',
      textColor: 'hsl(var(--card-foreground))',
      arrowColor: 'hsl(var(--card))',
      overlayColor: 'hsl(220 14% 8% / 0.55)',
      zIndex: 10000,
    },
    styles: {
      tooltip: {
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 10px 30px -10px hsl(220 14% 8% / 0.35)',
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
      buttonPrimary: {
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
    },
  });

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
      controls.reset();
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
  }, [currentTour, controls]);

  // Démarre/arrête joyride en réponse à activeTour + steps
  useEffect(() => {
    if (!activeTour) return;
    if (steps.length === 0) {
      // Aucune cible disponible : on marque comme terminé pour ne pas re-déclencher
      logger.info('[onboarding] no valid steps for tour, skipping', activeTour);
      void markTourCompleted(activeTour).finally(() => stopTour());
      return;
    }
    controls.start(0);
    // Marque le tour comme vu dès son démarrage : qu'il soit terminé,
    // skippé, fermé via X, ou interrompu par un refresh, il ne se
    // redéclenchera plus automatiquement. L'utilisateur peut toujours
    // le relancer manuellement depuis les Réglages (forceStartTour).
    void markTourCompleted(activeTour);
    // Cleanup : si le composant change de tour, on remet à zéro
    return () => {
      controls.reset();
    };
  }, [activeTour, steps, controls, markTourCompleted, stopTour]);

  // Souscriptions aux événements Joyride pour terminer/skipper
  useEffect(() => {
    const offEnd = on(EVENTS.TOUR_END, (data: EventData) => {
      if (!activeTour) return;
      const status = data.status;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        void markTourCompleted(activeTour);
        stopTour();
      }
    });
    const offErr = on(EVENTS.TARGET_NOT_FOUND, () => {
      if (!activeTour) return;
      logger.warn('[onboarding] target not found, ending tour', activeTour);
      void markTourCompleted(activeTour);
      stopTour();
    });
    return () => {
      offEnd();
      offErr();
    };
  }, [on, activeTour, markTourCompleted, stopTour]);

  return Tour;
}
