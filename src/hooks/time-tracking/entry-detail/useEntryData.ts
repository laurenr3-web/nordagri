
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for fetching and processing time entry data
 */
export function useEntryData(id: string | undefined) {
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
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

  return {
    entry,
    setEntry,
    isLoading
  };
}
