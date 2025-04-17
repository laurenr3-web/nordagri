
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTimeEntryDetail(id: string | undefined) {
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [showClosureDialog, setShowClosureDialog] = useState(false);

  const fetchEntry = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast.error("Vous devez être connecté pour voir les détails");
        navigate('/auth');
        return;
      }

      // Fetch all time entries for the user, then filter by the specific ID
      // This ensures we can access completed sessions as well
      const data = await timeTrackingService.getTimeEntries({
        userId: sessionData.session.user.id,
      });

      const foundEntry = data.find(e => String(e.id) === String(id));
      
      if (foundEntry) {
        // Ensure required fields exist
        const enhancedEntry: TimeEntry = {
          ...foundEntry,
          user_name: foundEntry.user_name || foundEntry.owner_name || 'Utilisateur',
          current_duration: foundEntry.current_duration || '00:00:00'
        };
        setEntry(enhancedEntry);
      } else {
        toast.error("Session introuvable");
        navigate('/time-tracking');
      }
    } catch (error) {
      console.error("Error fetching time entry:", error);
      toast.error("Erreur lors du chargement des détails");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id, navigate]);

  useEffect(() => {
    if (entry && entry.start_time) {
      const hourlyRate = 50;
      const start = new Date(entry.start_time);
      
      // For completed sessions, use the fixed end time
      const end = (entry.status === 'completed' && entry.end_time) 
        ? new Date(entry.end_time) 
        : new Date();
        
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      setEstimatedCost(Math.round(hours * hourlyRate * 100) / 100);
    }
  }, [entry]);

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
