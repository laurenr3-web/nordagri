
import { useEntryData } from './useEntryData';
import { useCostEstimate } from './useCostEstimate';
import { useEntryActions } from './useEntryActions';
import { useNewTaskPreparation } from './useNewTaskPreparation';
import { TimeEntry } from '@/hooks/time-tracking/types';

/**
 * Main hook that composes all time entry detail functionality
 */
export function useTimeEntryDetail(id: string | undefined) {
  const { entry, setEntry, isLoading } = useEntryData(id);
  const estimatedCost = useCostEstimate(entry);
  const { 
    showClosureDialog,
    handlePauseResume, 
    handleStop,
    handleCloseClosureDialog,
    handleSubmitClosureForm,
    handleNotesChange,
    handleCreateIntervention
  } = useEntryActions(entry, setEntry);
  const { prepareNewTaskData } = useNewTaskPreparation(entry);

  return {
    entry,
    isLoading,
    estimatedCost,
    showClosureDialog,
    handlePauseResume,
    handleStop,
    handleCloseClosureDialog,
    handleSubmitClosureForm,
    handleNotesChange,
    handleCreateIntervention,
    prepareNewTaskData
  };
}

// Re-export the hooks for individual use if needed
export {
  useEntryData,
  useCostEstimate,
  useEntryActions,
  useNewTaskPreparation
};
