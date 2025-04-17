
import { useNavigate } from 'react-router-dom';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for preparing and creating new tasks from an existing entry
 */
export function useNewTaskPreparation(entry: TimeEntry | null) {
  const navigate = useNavigate();

  const prepareNewTaskData = async (formData: any) => {
    if (!entry) return null;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error("Vous devez être connecté pour démarrer une nouvelle session");
        navigate('/auth');
        return null;
      }
      
      // Get journee_id from the closed session to link sessions in a single day
      const previousSession = await timeTrackingService.getTimeEntryById(entry.id);
      
      // Start a new time entry with some data carried over from the previous one
      const newEntry = await timeTrackingService.startTimeEntry(sessionData.session.user.id, {
        equipment_id: formData.equipment_id,
        intervention_id: formData.intervention_id,
        task_type: formData.task_type,
        task_type_id: formData.task_type_id,
        custom_task_type: formData.custom_task_type,
        title: formData.title,
        notes: formData.notes,
        location: formData.location,
        journee_id: previousSession?.journee_id // Link to the same working day
      });
      
      toast.success('Nouvelle session démarrée');
      return newEntry.id;
      
    } catch (error) {
      console.error('Error starting new task:', error);
      toast.error('Erreur lors du démarrage de la nouvelle tâche');
      return null;
    }
  };

  return {
    prepareNewTaskData
  };
}
