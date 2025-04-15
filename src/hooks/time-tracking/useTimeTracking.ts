
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { useTimeEntryState } from './useTimeEntryState';
import { useTimeEntryActions } from './useTimeEntryActions';

export function useTimeTracking() {
  const { 
    activeTimeEntry,
    isLoading,
    error,
    setActiveTimeEntry,
    setIsLoading,
    setError,
    calculateInitialDuration
  } = useTimeEntryState();

  const {
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry
  } = useTimeEntryActions();

  useEffect(() => {
    fetchActiveTimeEntry();
  }, []);

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
