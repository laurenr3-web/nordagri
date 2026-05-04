
import { useState, useEffect } from 'react';
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

  const fetchTimeEntries = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Resolve all farm member user_ids so the history shows sessions
      // completed by every member of the farm (not just the current user).
      const set = new Set<string>([userId]);
      const [{ data: ownedFarms }, { data: memberships }] = await Promise.all([
        supabase.from('farms').select('id').eq('owner_id', userId),
        supabase.from('farm_members').select('farm_id').eq('user_id', userId),
      ]);
      const farmIds = Array.from(
        new Set([
          ...(ownedFarms ?? []).map((f: any) => f.id),
          ...(memberships ?? []).map((m: any) => m.farm_id),
        ]),
      );
      if (farmIds.length > 0) {
        const [{ data: farms }, { data: members }] = await Promise.all([
          supabase.from('farms').select('owner_id').in('id', farmIds),
          supabase.from('farm_members').select('user_id').in('farm_id', farmIds),
        ]);
        (farms ?? []).forEach((f: any) => f.owner_id && set.add(f.owner_id));
        (members ?? []).forEach((m: any) => m.user_id && set.add(m.user_id));
      }
      const userIds = Array.from(set);

      const data = await timeTrackingService.getTimeEntries({
        userId,
        userIds,
        startDate: dateRange.from,
        endDate: dateRange.to,
        equipmentId: equipmentFilter,
        taskType: taskTypeFilter as any,
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
