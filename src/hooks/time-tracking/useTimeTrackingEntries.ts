
import { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from './types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useTimeTrackingEntries(
  userId: string | null,
  dateRange: { from: Date; to: Date },
  equipmentFilter?: number,
  taskTypeFilter?: string
) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeEntries = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await timeTrackingService.getTimeEntries({
        userId,
        startDate: dateRange.from,
        endDate: dateRange.to,
        equipmentId: equipmentFilter,
        taskType: taskTypeFilter as any
      });
      
      setEntries(data);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast.error("Could not load time sessions");
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateRange, equipmentFilter, taskTypeFilter]);

  const handleResumeTimeEntry = useCallback(async (entryId: string) => {
    try {
      await timeTrackingService.resumeTimeEntry(entryId);
      toast.success("Session resumed");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error resuming time tracking:", error);
      toast.error("Could not resume session");
    }
  }, [fetchTimeEntries]);

  const handleDeleteTimeEntry = useCallback(async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Session deleted");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Could not delete session");
    }
  }, [fetchTimeEntries]);

  const handleStopTimeEntry = useCallback(async (entryId: string) => {
    try {
      navigate(`/time-tracking/detail/${entryId}`);
      toast.info("Accès à la page de clôture de la session");
    } catch (error) {
      console.error("Error navigating to time entry detail:", error);
      toast.error("Impossible d'accéder à la page de clôture");
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchTimeEntries();
    }
  }, [userId, fetchTimeEntries]);

  // Écouter les changements des sessions en temps réel au lieu d'utiliser refetchInterval
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('time_entries_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'time_sessions',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchTimeEntries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTimeEntries]);

  return {
    entries,
    isLoading,
    handleResumeTimeEntry,
    handleDeleteTimeEntry,
    handleStopTimeEntry,
    fetchTimeEntries
  };
}
