
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTracking';
import { useTimeEntryState } from './useTimeEntryState';

export function useSessionManagement() {
  const { 
    setActiveTimeEntry, 
    setIsLoading, 
    setError,
    calculateInitialDuration
  } = useTimeEntryState();

  const fetchActiveTimeEntry = async () => {
    try {
      setIsLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setActiveTimeEntry(null);
        return;
      }
      
      const userId = sessionData.session.user.id;
      const activeEntry = await timeTrackingService.getActiveTimeEntry(userId);
      
      if (activeEntry) {
        setActiveTimeEntry({
          ...activeEntry,
          current_duration: calculateInitialDuration(activeEntry.start_time)
        });
      } else {
        setActiveTimeEntry(null);
      }
    } catch (err) {
      console.error("Error fetching active time entry:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTimeEntry();
  }, []);

  return {
    fetchActiveTimeEntry
  };
}
