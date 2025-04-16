
import { toast } from 'sonner';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntryTaskType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { checkAuthStatus } from '@/utils/authUtils';

export function useTimeEntryOperations() {
  const startTimeEntry = async (params: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    task_type_id?: string;
    custom_task_type?: string;
    location_id?: number;
    location?: string;
    notes?: string;
    coordinates?: { lat: number; lng: number };
    title?: string;
  }) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("You must be logged in to track time.");
      }
      
      const userId = sessionData.session.user.id;
      const locationName = params.location || 
                          (params.location_id ? `Location ${params.location_id}` : undefined);
      
      // Log auth status for debugging
      await checkAuthStatus();
      
      // Check permissions on time_sessions table
      await checkTablePermissions('time_sessions');
      
      const newEntry = await timeTrackingService.startTimeEntry(userId, {
        ...params,
        location: locationName
      });
      
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
  };

  const stopTimeEntry = async (timeEntryId: string) => {
    try {
      // Log auth status for debugging
      await checkAuthStatus();
      
      // Check permissions on time_sessions table
      await checkTablePermissions('time_sessions', timeEntryId);
      
      await timeTrackingService.stopTimeEntry(timeEntryId);
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
  };

  const pauseTimeEntry = async (timeEntryId: string) => {
    try {
      // Log auth status for debugging
      await checkAuthStatus();
      
      // Check permissions on time_sessions table
      await checkTablePermissions('time_sessions', timeEntryId);
      
      await timeTrackingService.pauseTimeEntry(timeEntryId);
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
  };

  const resumeTimeEntry = async (timeEntryId: string) => {
    try {
      // Log auth status for debugging
      await checkAuthStatus();
      
      // Check permissions on time_sessions table
      await checkTablePermissions('time_sessions', timeEntryId);
      
      await timeTrackingService.resumeTimeEntry(timeEntryId);
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
  };

  return {
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry
  };
}

