
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { toast } from 'sonner';

type EntrySetterFunction = (entry: TimeEntry | null) => void;

/**
 * Hook for actions that can be performed on a time entry
 */
export function useEntryActions(
  entry: TimeEntry | null,
  setEntry: EntrySetterFunction
) {
  const navigate = useNavigate();
  const [showClosureDialog, setShowClosureDialog] = useState(false);

  // Pause or resume the entry
  const handlePauseResume = async () => {
    if (!entry) return;
    
    try {
      let updatedEntry;
      
      if (entry.status === 'active') {
        updatedEntry = await timeTrackingService.pauseTimeEntry(entry.id);
        toast.success('Session mise en pause');
      } else if (entry.status === 'paused') {
        updatedEntry = await timeTrackingService.resumeTimeEntry(entry.id);
        toast.success('Session reprise');
      }
      
      if (updatedEntry) {
        setEntry(updatedEntry);
      }
    } catch (error) {
      console.error('Error toggling session state:', error);
      toast.error('Erreur lors du changement d\'état de la session');
    }
  };

  // Stop the entry
  const handleStop = () => {
    if (!entry) return;
    setShowClosureDialog(true);
  };

  // Close the closure dialog
  const handleCloseClosureDialog = () => {
    setShowClosureDialog(false);
  };

  // Submit the closure form
  const handleSubmitClosureForm = async (formData: any) => {
    if (!entry) return;
    
    try {
      // Update entry with form data first
      let updatedEntry = await timeTrackingService.updateTimeEntry(entry.id, {
        notes: formData.notes,
        task_type_id: formData.task_type_id,
        custom_task_type: formData.custom_task_type
      });
      
      // Then stop the entry
      updatedEntry = await timeTrackingService.stopTimeEntry(entry.id);
      
      toast.success('Session terminée avec succès');
      setShowClosureDialog(false);
      navigate('/time-tracking');
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Erreur lors de la clôture de la session');
    }
  };

  // Update the notes of the entry
  const handleNotesChange = async (notes: string) => {
    if (!entry) return;
    
    try {
      const updatedEntry = await timeTrackingService.updateTimeEntry(entry.id, { notes });
      setEntry(updatedEntry);
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  // Create an intervention from the entry
  const handleCreateIntervention = async () => {
    if (!entry) return;
    // Implement if needed
    toast.info('Fonctionnalité à implémenter');
  };

  return {
    showClosureDialog,
    handlePauseResume,
    handleStop,
    handleCloseClosureDialog,
    handleSubmitClosureForm,
    handleNotesChange,
    handleCreateIntervention
  };
}
