
import { toast } from 'sonner';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntryTaskType } from './types';
import { useTimeEntryState } from './useTimeEntryState';
import { supabase } from '@/integrations/supabase/client';

export function useTimeEntryActions() {
  const { 
    setActiveTimeEntry, 
    setIsLoading, 
    setError, 
    calculateInitialDuration 
  } = useTimeEntryState();

  const startTimeEntry = async (params: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    task_type_id?: string;
    custom_task_type?: string;
    location?: string;
    notes?: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const newEntry = await timeTrackingService.startTimeEntry(session.session.user.id, params);
      
      setActiveTimeEntry({
        ...newEntry,
        current_duration: calculateInitialDuration(newEntry.start_time)
      });
      
      toast.success('Time tracking started');
      return newEntry;
    } catch (err) {
      console.error("Error starting time tracking:", err);
      toast.error('Error starting time tracking');
      throw err;
    }
  };

  const stopTimeEntry = async (timeEntryId: string) => {
    try {
      await timeTrackingService.stopTimeEntry(timeEntryId);
      setActiveTimeEntry(null);
      toast.success('Time tracking stopped');
    } catch (err) {
      console.error("Error stopping time tracking:", err);
      toast.error('Error stopping time tracking');
      throw err;
    }
  };

  const pauseTimeEntry = async (timeEntryId: string) => {
    try {
      await timeTrackingService.pauseTimeEntry(timeEntryId);
      setActiveTimeEntry(prev => prev ? {...prev, status: 'paused'} : null);
      toast.success('Time tracking paused');
    } catch (err) {
      console.error("Error pausing time tracking:", err);
      toast.error('Error pausing');
      throw err;
    }
  };

  const resumeTimeEntry = async (timeEntryId: string) => {
    try {
      await timeTrackingService.resumeTimeEntry(timeEntryId);
      setActiveTimeEntry(prev => prev ? {...prev, status: 'active'} : null);
      toast.success('Time tracking resumed');
    } catch (err) {
      console.error("Error resuming time tracking:", err);
      toast.error('Error resuming');
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
