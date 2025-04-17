
import { useState, useEffect } from 'react';
import { TimeEntry } from './types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useTimeTrackingEntries(
  userId: string | null,
  dateRange: { from: Date; to: Date },
  equipmentFilter?: number,
  taskTypeFilter?: string
) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeEntries = async () => {
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
  };

  const handleResumeTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.resumeTimeEntry(entryId);
      toast.success("Session resumed");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error resuming time tracking:", error);
      toast.error("Could not resume session");
    }
  };

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Session deleted");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Could not delete session");
    }
  };

  const handleStopTimeEntry = async (entryId: string) => {
    try {
      navigate(`/time-tracking/detail/${entryId}`);
      toast.info("Accès à la page de clôture de la session");
    } catch (error) {
      console.error("Error navigating to time entry detail:", error);
      toast.error("Impossible d'accéder à la page de clôture");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTimeEntries();
    }
  }, [userId, dateRange, equipmentFilter, taskTypeFilter]);

  return {
    entries,
    isLoading,
    handleResumeTimeEntry,
    handleDeleteTimeEntry,
    handleStopTimeEntry,
    fetchTimeEntries
  };
}
