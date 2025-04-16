
import { useActiveTimeEntry } from './useActiveTimeEntry';
import { useTimeEntryOperations } from './useTimeEntryOperations';

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

  const startTimeEntry = async (params: Parameters<typeof startOperation>[0]) => {
    const newEntry = await startOperation(params);
    await refreshActiveTimeEntry();
    return newEntry;
  };

  const stopTimeEntry = async (timeEntryId: string) => {
    await stopOperation(timeEntryId);
    setActiveTimeEntry(null);
  };

  const pauseTimeEntry = async (timeEntryId: string) => {
    await pauseOperation(timeEntryId);
    await refreshActiveTimeEntry();
  };

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
