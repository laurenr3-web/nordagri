import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { useFarmId } from '@/hooks/useFarmId';
import { useActiveWorkShift, useWorkShiftMutations } from './useWorkShift';
import { planningTimeService } from '@/services/planning/planningTimeService';
import { useQueryClient } from '@tanstack/react-query';

interface ActiveTaskSession {
  sessionId: string;
  taskId: string | null;
  title: string | null;
}

export function useWorkShiftActions() {
  const { user } = useAuthContext();
  const { farmId } = useFarmId();
  const qc = useQueryClient();
  const userId = user?.id ?? null;

  const { data: activeShift, isLoading } = useActiveWorkShift(userId);
  const { punchIn, punchOut } = useWorkShiftMutations();

  const [reportShiftId, setReportShiftId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingShiftId, setPendingShiftId] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<ActiveTaskSession | null>(null);

  const handlePunchIn = useCallback(async (): Promise<void> => {
    if (!userId || !farmId) return;
    await punchIn.mutateAsync({ userId, farmId });
  }, [userId, farmId, punchIn]);

  const findActiveTaskSession = useCallback(async (): Promise<ActiveTaskSession | null> => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('time_sessions')
      .select('id,task_id,title')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { sessionId: data.id, taskId: data.task_id ?? null, title: data.title ?? null };
  }, [userId]);

  const handlePunchOut = useCallback(async (): Promise<void> => {
    if (!activeShift) return;
    const active = await findActiveTaskSession();
    if (active && active.taskId) {
      setPendingShiftId(activeShift.id);
      setPendingTask(active);
      setConfirmOpen(true);
      return;
    }
    await punchOut.mutateAsync({ shiftId: activeShift.id });
  }, [activeShift, findActiveTaskSession, punchOut]);

  const confirmPunchOutWithPause = useCallback(async (): Promise<void> => {
    if (!pendingShiftId || !pendingTask?.taskId) return;
    try {
      await planningTimeService.pauseSessionForTask(pendingTask.taskId);
    } finally {
      qc.invalidateQueries({ queryKey: ['task-time-stats', pendingTask.taskId] });
      qc.invalidateQueries({ queryKey: ['planningTasks'] });
    }
    await punchOut.mutateAsync({ shiftId: pendingShiftId });
    setConfirmOpen(false);
    setPendingShiftId(null);
    setPendingTask(null);
  }, [pendingShiftId, pendingTask, punchOut, qc]);

  const cancelPunchOut = useCallback((): void => {
    setConfirmOpen(false);
    setPendingShiftId(null);
    setPendingTask(null);
  }, []);

  const openReport = useCallback((shiftId: string): void => {
    setReportShiftId(shiftId);
    setReportOpen(true);
  }, []);

  return {
    userId,
    farmId,
    activeShift: activeShift ?? null,
    isLoading,
    isPunchingIn: punchIn.isPending,
    isPunchingOut: punchOut.isPending,
    handlePunchIn,
    handlePunchOut,
    confirmPunchOutWithPause,
    cancelPunchOut,
    confirmOpen,
    pendingTaskTitle: pendingTask?.title ?? null,
    reportShiftId,
    reportOpen,
    openReport,
    setReportOpen,
  };
}
