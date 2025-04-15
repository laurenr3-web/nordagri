
import { useTimeEntryState } from './useTimeEntryState';
import { useTimeEntryActions } from './useTimeEntryActions';
import { useSessionManagement } from './useSessionManagement';

export function useTimeTracking() {
  const { 
    activeTimeEntry,
    isLoading,
    error
  } = useTimeEntryState();

  const {
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry
  } = useTimeEntryActions();

  const { fetchActiveTimeEntry } = useSessionManagement();

  return {
    activeTimeEntry,
    isLoading,
    error,
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry,
    refreshActiveTimeEntry: fetchActiveTimeEntry
  };
}
