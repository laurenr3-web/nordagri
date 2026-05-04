import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { usePlanningTimeMutations } from '@/hooks/planning/usePlanningTaskTime';
import { ERR_USER_SESSION_ACTIVE } from '@/services/planning/planningTimeService';
import type { PlanningTask } from '@/services/planning/planningService';
import type { WorkTodayItem } from '@/components/dashboard/v2/WorkTodayCard';

function buildTask(item: WorkTodayItem): PlanningTask {
  return {
    id: item.id,
    farm_id: item.farmId as string,
    title: item.title,
    category: (item.category ?? 'autre') as PlanningTask['category'],
    equipment_id: item.equipmentId ?? null,
    due_date: item.dueDate ?? new Date().toISOString().slice(0, 10),
  } as PlanningTask;
}

export function useStartTaskFromDashboard() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { start } = usePlanningTimeMutations();
  const [conflictItem, setConflictItem] = useState<WorkTodayItem | null>(null);
  const [busy, setBusy] = useState(false);

  const invalidateDashboard = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['planningTasks'] });
    qc.invalidateQueries({ queryKey: ['planningOverdue'] });
    qc.invalidateQueries({ queryKey: ['active-time-entry'] });
    qc.invalidateQueries({ queryKey: ['active-work-shift'] });
    qc.invalidateQueries({ queryKey: ['dashboard-v2', 'activeTeam'] });
    qc.invalidateQueries({ queryKey: ['dashboard-v2', 'signals'] });
    qc.invalidateQueries({ queryKey: ['farm-team-status'] });
  }, [qc]);

  const startTask = useCallback(
    async (item: WorkTodayItem) => {
      if (!user?.id || item.itemType !== 'task' || !item.farmId) return;
      try {
        setBusy(true);
        await start.mutateAsync({ task: buildTask(item), userId: user.id });
        toast.success('Tâche commencée · Temps démarré');
        invalidateDashboard();
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === ERR_USER_SESSION_ACTIVE) {
          setConflictItem(item);
        }
        // Other errors already toasted by underlying mutation
      } finally {
        setBusy(false);
      }
    },
    [start, user?.id, invalidateDashboard],
  );

  const cancelConflict = useCallback(() => setConflictItem(null), []);

  const confirmEndCurrentAndStart = useCallback(async () => {
    if (!user?.id || !conflictItem) return;
    try {
      setBusy(true);
      const { error: endErr } = await supabase
        .from('time_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (endErr) throw endErr;

      await start.mutateAsync({ task: buildTask(conflictItem), userId: user.id });
      toast.success('Nouvelle tâche commencée · Temps démarré');
      invalidateDashboard();
      setConflictItem(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  }, [conflictItem, user?.id, start, invalidateDashboard]);

  const confirmStartWithoutTime = useCallback(async () => {
    if (!conflictItem) return;
    try {
      setBusy(true);
      const { error } = await supabase
        .from('planning_tasks')
        .update({ status: 'in_progress' })
        .eq('id', conflictItem.id);
      if (error) throw error;
      toast.success('Tâche commencée');
      invalidateDashboard();
      setConflictItem(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de commencer la tâche.');
    } finally {
      setBusy(false);
    }
  }, [conflictItem, invalidateDashboard]);

  return {
    startTask,
    conflictItem,
    cancelConflict,
    confirmEndCurrentAndStart,
    confirmStartWithoutTime,
    isLoading: busy || start.isPending,
  };
}
