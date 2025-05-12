
import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/dateHelpers';
import { TimeEntry } from './types';
import { useGlobalStore } from '@/store';

/**
 * Hook pour gérer l'affichage du chronomètre pour une entrée de temps active
 * 
 * Calcule et met à jour la durée écoulée pour une entrée de temps active,
 * avec gestion des pauses et reprises.
 * 
 * @param {TimeEntry | null} activeTimeEntry - L'entrée de temps active à chronométrer
 * @returns {string} Durée formatée (HH:MM:SS)
 */
export function useTimer(activeTimeEntry: TimeEntry | null) {
  const [duration, setDuration] = useState<string>('00:00:00');
  const timeTracking = useGlobalStore(state => state.timeTracking);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Reset timer if there's no active entry
    if (!activeTimeEntry) {
      setDuration('00:00:00');
      return;
    }
    
    // Initial calculation regardless of status
    const start = new Date(activeTimeEntry.start_time);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    setDuration(formatDuration(diffMs));
    
    // Only set up interval for active entries
    if (activeTimeEntry.status === 'active' && timeTracking.isRunning) {
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry, timeTracking.isRunning]);

  return duration;
}
