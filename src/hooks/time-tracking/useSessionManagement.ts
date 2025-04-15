
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTracking';
import { useTimeEntryState } from './useTimeEntryState';
import { TimeEntryTaskType } from './types';

export function useSessionManagement() {
  const { 
    setActiveTimeEntry, 
    setIsLoading, 
    setError,
    calculateInitialDuration,
    fetchUserName
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
      
      // Also fetch the user's name
      fetchUserName();
      
      if (activeEntry) {
        // If we have an active entry, fetch the task type name
        if (activeEntry.task_type_id) {
          const { data } = await supabase
            .from('task_types')
            .select('name')
            .eq('id', activeEntry.task_type_id)
            .single();
          
          if (data) {
            // Convert the string to TimeEntryTaskType
            activeEntry.task_type = data.name as TimeEntryTaskType;
          }
        }
        
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
