
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { toast } from 'sonner';

/**
 * Hook for time entry action handlers (pause/resume, stop, notes update)
 */
export function useEntryActions(entry: TimeEntry | null, setEntry: (entry: TimeEntry | null) => void) {
  const navigate = useNavigate();
  const [showClosureDialog, setShowClosureDialog] = useState(false);

  const handlePauseResume = async () => {
    if (!entry) return;
    try {
      if (entry.status === 'active') {
        await timeTrackingService.pauseTimeEntry(entry.id);
        setEntry({ ...entry, status: 'paused' });
        toast.success('Session mise en pause');
      } else {
        await timeTrackingService.resumeTimeEntry(entry.id);
        setEntry({ ...entry, status: 'active' });
        toast.success('Session reprise');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleStop = async () => {
    if (!entry) return;
    setShowClosureDialog(true);
  };

  const handleCloseClosureDialog = () => {
    setShowClosureDialog(false);
  };
  
  const handleSubmitClosureForm = async (data: any) => {
    if (!entry) return;
    try {
      // First update the entry notes if they were changed
      if (data.notes && data.notes !== entry.notes) {
        await timeTrackingService.updateTimeEntry(entry.id, { 
          ...entry, 
          notes: data.notes 
        });
      }
      
      // Then stop the time entry
      await timeTrackingService.stopTimeEntry(entry.id);
      
      // Update local state
      setEntry({ 
        ...entry, 
        status: 'completed', 
        notes: data.notes || entry.notes,
        end_time: new Date().toISOString()
      });
      setShowClosureDialog(false);
      
      toast.success('Session terminée avec succès');
      
      // If user wants to start a new task immediately, don't redirect
      if (!data.startNewTask) {
        // Redirect to time tracking main page after a short delay
        setTimeout(() => {
          navigate('/time-tracking');
        }, 1500);
      }
    } catch (error) {
      console.error('Error stopping time entry:', error);
      toast.error('Erreur lors de l\'arrêt de la session');
    }
  };

  const handleNotesChange = async (notes: string) => {
    if (!entry) return;
    try {
      await timeTrackingService.updateTimeEntry(entry.id, { ...entry, notes });
      setEntry({ ...entry, notes });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  const handleCreateIntervention = () => {
    if (!entry) return;
    navigate('/interventions/new', {
      state: {
        equipment_id: entry.equipment_id,
        equipment_name: entry.equipment_name,
        duration: entry.current_duration || "00:00:00",
        notes: entry.notes
      }
    });
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
