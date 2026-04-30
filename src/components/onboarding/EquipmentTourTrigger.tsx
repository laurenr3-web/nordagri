import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface EquipmentTourTriggerProps {
  isLoading: boolean;
  hasEquipment: boolean;
}

/**
 * Déclenche le tour 'equipment' une fois sur la page de détail :
 * - prefs chargées
 * - tour welcome terminé
 * - tour equipment non terminé
 * - aucun tour actif
 * - équipement chargé (isLoading === false)
 */
export function EquipmentTourTrigger({ isLoading, hasEquipment }: EquipmentTourTriggerProps) {
  const { prefsLoaded, completedTours, currentTour, startTour } = useOnboarding();

  useEffect(() => {
    if (!prefsLoaded) return;
    if (!completedTours.includes('welcome')) return;
    if (completedTours.includes('equipment')) return;
    if (currentTour !== null) return;
    if (isLoading) return;
    if (!hasEquipment) return;
    startTour('equipment');
  }, [prefsLoaded, completedTours, currentTour, isLoading, hasEquipment, startTour]);

  return null;
}