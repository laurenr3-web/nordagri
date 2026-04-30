import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface MaintenanceTourTriggerProps {
  isLoading: boolean;
}

/**
 * Déclenche le tour 'maintenance' une fois sur /maintenance :
 * - prefs chargées
 * - tour welcome terminé
 * - tour maintenance non terminé
 * - aucun tour actif
 * - chargement terminé
 */
export function MaintenanceTourTrigger({ isLoading }: MaintenanceTourTriggerProps) {
  const { prefsLoaded, completedTours, currentTour, startTour } = useOnboarding();

  useEffect(() => {
    if (!prefsLoaded) return;
    if (!completedTours.includes('welcome')) return;
    if (completedTours.includes('maintenance')) return;
    if (currentTour !== null) return;
    if (isLoading) return;
    startTour('maintenance');
  }, [prefsLoaded, completedTours, currentTour, isLoading, startTour]);

  return null;
}