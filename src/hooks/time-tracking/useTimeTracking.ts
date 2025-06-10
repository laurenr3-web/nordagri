
import { useActiveTimeEntryOptimized } from './useActiveTimeEntryOptimized';
import { useTimeEntryOperations } from './useTimeEntryOperations';
import { StartTimeEntryData } from '@/services/supabase/time-tracking/types';

export function useTimeTracking() {
  const {
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    error,
    refreshActiveTimeEntry
  } = useActiveTimeEntryOptimized();

  const {
    startTimeEntry: startTimeEntryOperation,
    stopTimeEntry: stopTimeEntryOperation,
    pauseTimeEntry: pauseTimeEntryOperation,
    resumeTimeEntry: resumeTimeEntryOperation
  } = useTimeEntryOperations();

  const startTimeEntry = async (data: StartTimeEntryData) => {
    const result = await startTimeEntryOperation(data);
    await refreshActiveTimeEntry();
    return result;
  };

  const stopTimeEntry = async (id: string) => {
    await stopTimeEntryOperation(id);
    setActiveTimeEntry(null);
  };

  const pauseTimeEntry = async (id: string) => {
    await pauseTimeEntryOperation(id);
    await refreshActiveTimeEntry();
  };

  const resumeTimeEntry = async (id: string) => {
    await resumeTimeEntryOperation(id);
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
