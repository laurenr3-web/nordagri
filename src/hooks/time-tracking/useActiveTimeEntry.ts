
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActiveTimeEntry, TimeEntry } from './types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { formatDuration } from '@/utils/dateHelpers';

export function useActiveTimeEntry() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        const start = new Date(activeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const initialDuration = formatDuration(diffMs);
        
        setActiveTimeEntry({
          ...activeEntry,
          current_duration: initialDuration
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
    setActiveTimeEntry,
    isLoading,
    error,
    refreshActiveTimeEntry: fetchActiveTimeEntry
  };
}
