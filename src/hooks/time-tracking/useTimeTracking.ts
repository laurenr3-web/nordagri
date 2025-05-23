
import { useActiveTimeEntry } from './useActiveTimeEntry';
import { useTimeEntryOperations } from './useTimeEntryOperations';
import { toast } from 'sonner';

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
    try {
      const newEntry = await startOperation(params);
      await refreshActiveTimeEntry();
      return newEntry;
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
      toast.error('Impossible de démarrer le suivi du temps');
      throw error;
    }
  };

  /**
   * Arrête une entrée de temps active
   * @param {string} timeEntryId - ID de l'entrée de temps à arrêter
   * @returns {Promise<void>}
   */
  const stopTimeEntry = async (timeEntryId: string) => {
    try {
      await stopOperation(timeEntryId);
      setActiveTimeEntry(null);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
      toast.error('Impossible d\'arrêter le suivi du temps');
      throw error;
    }
  };

  /**
   * Met en pause une entrée de temps active
   * @param {string} timeEntryId - ID de l'entrée de temps à mettre en pause
   * @returns {Promise<void>}
   */
  const pauseTimeEntry = async (timeEntryId: string) => {
    try {
      await pauseOperation(timeEntryId);
      await refreshActiveTimeEntry();
    } catch (error) {
      console.error('Erreur lors de la mise en pause:', error);
      toast.error('Impossible de mettre en pause le suivi du temps');
      throw error;
    }
  };

  /**
   * Reprend une entrée de temps en pause
   * @param {string} timeEntryId - ID de l'entrée de temps à reprendre
   * @returns {Promise<void>}
   */
  const resumeTimeEntry = async (timeEntryId: string) => {
    try {
      await resumeOperation(timeEntryId);
      await refreshActiveTimeEntry();
    } catch (error) {
      console.error('Erreur lors de la reprise:', error);
      toast.error('Impossible de reprendre le suivi du temps');
      throw error;
    }
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
