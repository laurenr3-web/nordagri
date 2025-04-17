
import { useState } from 'react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { supabase } from '@/integrations/supabase/client';
import { updateTimeEntry } from '@/services/supabase/time-tracking/operations/updateTimeEntry';
import { pauseTimeEntry } from '@/services/supabase/time-tracking/operations/pauseTimeEntry';
import { resumeTimeEntry } from '@/services/supabase/time-tracking/operations/resumeTimeEntry';
import { stopTimeEntry } from '@/services/supabase/time-tracking/operations/stopTimeEntry';
import { toast } from 'sonner';

export function useEntryActions(entryId: string | undefined, onRefresh: () => void) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  const handlePauseResume = async (): Promise<void> => {
    if (!entryId) return;
    
    try {
      setIsUpdating(true);
      
      // Toggle between pause and resume based on current status
      if (status === 'active') {
        await pauseTimeEntry(entryId);
        toast.success('Session mise en pause');
      } else if (status === 'paused') {
        await resumeTimeEntry(entryId);
        toast.success('Session reprise');
      }
      
      onRefresh();
    } catch (error) {
      console.error('Error toggling pause/resume:', error);
      toast.error('Erreur lors de la mise à jour de la session');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleStop = async (): Promise<void> => {
    if (!entryId) return;
    
    try {
      setIsUpdating(true);
      await stopTimeEntry(entryId);
      toast.success('Session terminée');
      onRefresh();
    } catch (error) {
      console.error('Error stopping time entry:', error);
      toast.error('Erreur lors de l\'arrêt de la session');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleNotesChange = async (notes: string): Promise<void> => {
    if (!entryId) return;
    
    try {
      setIsUpdating(true);
      await updateTimeEntry(entryId, { notes });
      toast.success('Notes mises à jour');
      onRefresh();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Erreur lors de la mise à jour des notes');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCreateIntervention = async (): Promise<void> => {
    // This would be implemented to create a new intervention
    toast.info('Création d\'une intervention en cours de développement');
  };
  
  return {
    isUpdating,
    handlePauseResume,
    handleStop,
    handleNotesChange,
    handleCreateIntervention
  };
}
