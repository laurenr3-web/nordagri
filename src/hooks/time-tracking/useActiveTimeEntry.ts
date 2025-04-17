import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActiveTimeEntry, TimeEntry } from './types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { formatDuration } from '@/utils/dateHelpers';

export function useActiveTimeEntry() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateCurrentDuration = (entry: TimeEntry) => {
    if (entry && entry.start_time) {
      const start = new Date(entry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      return {
        ...entry,
        current_duration: formatDuration(diffMs)
      };
    }
    return entry;
  };

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
        setActiveTimeEntry(updateCurrentDuration(activeEntry));
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

  // Timer effect to update duration in real-time
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      intervalId = setInterval(() => {
        setActiveTimeEntry(prev => prev ? updateCurrentDuration(prev) : null);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry?.id, activeTimeEntry?.status]);

  // Load the active time entry when the component mounts
  useEffect(() => {
    fetchActiveTimeEntry();
    
    // Set up a realtime subscription to listen for changes to time_sessions
    const channel = supabase
      .channel('time_sessions_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'time_sessions'
        }, 
        (payload) => {
          console.log('Realtime update received for time_sessions:', payload);
          fetchActiveTimeEntry();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    error,
    refreshActiveTimeEntry: fetchActiveTimeEntry
  };
}
