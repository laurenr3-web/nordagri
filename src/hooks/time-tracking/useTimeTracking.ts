
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, ActiveTimeEntry, TimeEntryTaskType, TimeEntryStatus } from './types';
import { toast } from 'sonner';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { formatDuration } from '@/utils/dateHelpers';

export function useTimeTracking() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load active time entry on mount
  useEffect(() => {
    fetchActiveTimeEntry();
  }, []);

  // Update timer for active time entry
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      // Update the timer every second
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        
        setActiveTimeEntry(prev => {
          if (!prev) return null;
          return {
            ...prev,
            current_duration: formatDuration(diffMs)
          };
        });
      }, 1000);
      
      // Initial timer update
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      
      setActiveTimeEntry(prev => {
        if (!prev) return null;
        return {
          ...prev,
          current_duration: formatDuration(diffMs)
        };
      });
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTimeEntry?.id, activeTimeEntry?.status]);

  // Fetch the active time entry for the current user
  async function fetchActiveTimeEntry() {
    try {
      setIsLoading(true);
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setActiveTimeEntry(null);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Get active time entry
      const activeEntry = await timeTrackingService.getActiveTimeEntry(userId);
      
      if (activeEntry) {
        setActiveTimeEntry({
          id: activeEntry.id,
          user_id: activeEntry.user_id,
          equipment_id: activeEntry.equipment_id,
          intervention_id: activeEntry.intervention_id,
          task_type: activeEntry.task_type,
          custom_task_type: activeEntry.task_type === 'other' ? activeEntry.intervention_title : undefined,
          start_time: activeEntry.start_time,
          status: activeEntry.status,
          equipment_name: activeEntry.equipment_name,
          intervention_title: activeEntry.intervention_title,
          location: activeEntry.location,
          created_at: activeEntry.created_at,
          updated_at: activeEntry.updated_at
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
  }

  // Start a new time entry
  async function startTimeEntry(params: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    custom_task_type?: string;
    location_id?: number;
    location?: string;
    notes?: string;
    coordinates?: { lat: number; lng: number };
  }) {
    try {
      // Check if there's already an active entry
      if (activeTimeEntry) {
        throw new Error("A time entry is already active. Stop it before starting a new one.");
      }
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("You must be logged in to track time.");
      }
      
      const userId = sessionData.session.user.id;
      
      // Prepare location data if provided
      const locationName = params.location || 
                          (params.location_id ? `Location ${params.location_id}` : undefined);
      
      // Start time entry
      const newEntry = await timeTrackingService.startTimeEntry(userId, {
        ...params,
        // If task_type is 'other', use custom_task_type for the title
        title: params.task_type === 'other' ? params.custom_task_type : undefined,
        location: locationName
      });
      
      // Update local state
      const newActiveEntry: ActiveTimeEntry = {
        id: newEntry.id,
        user_id: newEntry.user_id,
        equipment_id: newEntry.equipment_id,
        intervention_id: newEntry.intervention_id,
        task_type: newEntry.task_type,
        custom_task_type: params.custom_task_type,
        start_time: newEntry.start_time,
        status: newEntry.status,
        equipment_name: newEntry.equipment_name,
        intervention_title: newEntry.intervention_title,
        location: locationName,
        location_id: params.location_id,
        created_at: newEntry.created_at,
        updated_at: newEntry.updated_at
      };
      
      setActiveTimeEntry(newActiveEntry);
      
      toast.success('Time tracking started', {
        description: 'The timer is now running.'
      });
      
      return newEntry;
    } catch (err) {
      console.error("Error starting time tracking:", err);
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Error starting time tracking'
      });
      throw err;
    }
  }

  // Stop an active time entry
  async function stopTimeEntry(timeEntryId: string) {
    try {
      // Check that the entry exists and is active
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Cannot stop this time entry.");
      }
      
      // Stop the entry
      await timeTrackingService.stopTimeEntry(timeEntryId);
      
      // Update local state
      setActiveTimeEntry(null);
      
      toast.success('Time tracking stopped', {
        description: 'Your time entry has been saved.'
      });
    } catch (err) {
      console.error("Error stopping time tracking:", err);
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Error stopping time tracking'
      });
      throw err;
    }
  }

  // Pause an active time entry
  async function pauseTimeEntry(timeEntryId: string) {
    try {
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Cannot pause this time entry.");
      }
      
      await timeTrackingService.pauseTimeEntry(timeEntryId);
      
      // Update local state
      setActiveTimeEntry(prev => prev ? {...prev, status: 'paused'} : null);
      
      toast.success('Time tracking paused', {
        description: 'You can resume later.'
      });
    } catch (err) {
      console.error("Error pausing time tracking:", err);
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Error pausing'
      });
      throw err;
    }
  }

  // Resume a paused time entry
  async function resumeTimeEntry(timeEntryId: string) {
    try {
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Cannot resume this time entry.");
      }
      
      await timeTrackingService.resumeTimeEntry(timeEntryId);
      
      // Update local state
      setActiveTimeEntry(prev => prev ? {...prev, status: 'active'} : null);
      
      toast.success('Time tracking resumed', {
        description: 'The timer is running again.'
      });
    } catch (err) {
      console.error("Error resuming time tracking:", err);
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Error resuming'
      });
      throw err;
    }
  }

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
