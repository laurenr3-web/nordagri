
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActiveTimeEntry, TimeEntry } from './types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { formatDuration } from '@/utils/dateHelpers';
import { useGlobalStore } from '@/store';

export function useActiveTimeEntry() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const setTimeTracking = useGlobalStore(state => state.setTimeTracking);

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
        setTimeTracking({ isRunning: false, activeSessionId: null });
        return;
      }
      
      const userId = sessionData.session.user.id;
      const activeEntry = await timeTrackingService.getActiveTimeEntry(userId);
      
      if (activeEntry) {
        const updatedEntry = updateCurrentDuration(activeEntry);
        setActiveTimeEntry(updatedEntry);
        setTimeTracking({ 
          isRunning: activeEntry.status === 'active', 
          activeSessionId: activeEntry.id 
        });
      } else {
        setActiveTimeEntry(null);
        setTimeTracking({ isRunning: false, activeSessionId: null });
      }
    } catch (err) {
      console.error("Error fetching active time entry:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setTimeTracking({ isRunning: false, activeSessionId: null });
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
    // We keep this subscription as it's critical for active time entries
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
          
          // Specifically handle session completion events
          if (
            (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') ||
            (payload.eventType === 'DELETE' && activeTimeEntry?.id === payload.old.id)
          ) {
            if (activeTimeEntry && (
              !payload.new?.id || 
              payload.new?.id === activeTimeEntry.id || 
              payload.old?.id === activeTimeEntry.id
            )) {
              // Clear the active time entry immediately on completion
              setActiveTimeEntry(null);
              setTimeTracking({ isRunning: false, activeSessionId: null });
              return;
            }
          }
          
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
