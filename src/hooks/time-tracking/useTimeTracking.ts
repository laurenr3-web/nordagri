
import { useActiveTimeEntry } from './useActiveTimeEntry';
import { useTimeEntryOperations } from './useTimeEntryOperations';

/**
 * Hook principal pour la gestion du suivi du temps
 * 
 * Combine la récupération de l'entrée de temps active et les opérations
 * de manipulation (démarrage, arrêt, pause, reprise) du suivi du temps.
 * 
 * @returns {Object} Méthodes et données pour le suivi du temps
 */
export function useTimeTracking() {
  const {
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    error,
    refreshActiveTimeEntry
  } = useActiveTimeEntry();

  const {
    startTimeEntry: startOperation,
    stopTimeEntry: stopOperation,
    pauseTimeEntry: pauseOperation,
    resumeTimeEntry: resumeOperation
  } = useTimeEntryOperations();

  /**
   * Démarre une nouvelle entrée de temps
   * @param {any} params - Paramètres de l'entrée de temps
   * @returns {Promise<any>} La nouvelle entrée de temps créée
   */
  const startTimeEntry = async (params: Parameters<typeof startOperation>[0]) => {
    const newEntry = await startOperation(params);
    await refreshActiveTimeEntry();
    return newEntry;
  };

  /**
   * Arrête une entrée de temps active
   * @param {string} timeEntryId - ID de l'entrée de temps à arrêter
   * @returns {Promise<void>}
   */
  const stopTimeEntry = async (timeEntryId: string) => {
    await stopOperation(timeEntryId);
    setActiveTimeEntry(null);
  };

  /**
   * Met en pause une entrée de temps active
   * @param {string} timeEntryId - ID de l'entrée de temps à mettre en pause
   * @returns {Promise<void>}
   */
  const pauseTimeEntry = async (timeEntryId: string) => {
    await pauseOperation(timeEntryId);
    await refreshActiveTimeEntry();
  };

  /**
   * Reprend une entrée de temps en pause
   * @param {string} timeEntryId - ID de l'entrée de temps à reprendre
   * @returns {Promise<void>}
   */
  const resumeTimeEntry = async (timeEntryId: string) => {
    await resumeOperation(timeEntryId);
    await refreshActiveTimeEntry();
  };

  return {
    activeTimeEntry,
    isLoading,
    error,
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry,
    refreshActiveTimeEntry
  };
}
