
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
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
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
      setEntry({ ...entry, status: 'completed', notes: data.notes || entry.notes });
      setShowClosureDialog(false);
      
      toast.success('Session terminée avec succès');
      
      // Redirect to time tracking main page after a short delay
      setTimeout(() => {
        navigate('/time-tracking');
      }, 1500);
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
  };
}
