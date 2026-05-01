import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  planningTimeService,
  ERR_USER_SESSION_ACTIVE,
  ERR_TASK_SESSION_ACTIVE,
  type TaskTimeStats,
  type TaskSessionRow,
} from '@/services/planning/planningTimeService';
import type { PlanningTask } from '@/services/planning/planningService';

export function useTaskTimeStats(taskId: string | null) {
  return useQuery<TaskTimeStats>({
    queryKey: ['task-time-stats', taskId],
    queryFn: () => planningTimeService.getTaskTimeStats(taskId as string),
    enabled: !!taskId,
    // Polling 10s UNIQUEMENT quand une session est active.
    // React Query gère son propre timer interne — pas de setInterval applicatif.
    refetchInterval: (query) => {
      const stats = query.state.data;
      return stats?.hasActive ? 10_000 : false;
    },
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function useTaskSessions(taskId: string | null) {
  return useQuery<TaskSessionRow[]>({
    queryKey: ['task-sessions', taskId],
    queryFn: () => planningTimeService.getTaskSessions(taskId as string),
    enabled: !!taskId,
    staleTime: 10_000,
  });
}

function mapErrorToast(err: unknown): void {
  const msg = err instanceof Error ? err.message : '';
  if (msg === ERR_USER_SESSION_ACTIVE) {
    toast.error('Vous avez déjà une session de temps en cours.');
  } else if (msg === ERR_TASK_SESSION_ACTIVE) {
    toast.error('Cette tâche est déjà en cours par un autre membre.');
  } else {
    toast.error(msg || 'Une erreur est survenue.');
  }
}

export function usePlanningTimeMutations() {
  const qc = useQueryClient();

  const invalidate = (taskId: string): void => {
    qc.invalidateQueries({ queryKey: ['task-time-stats', taskId] });
    qc.invalidateQueries({ queryKey: ['task-sessions', taskId] });
    qc.invalidateQueries({ queryKey: ['planningTasks'] });
    qc.invalidateQueries({ queryKey: ['planningOverdue'] });
    qc.invalidateQueries({ queryKey: ['planningRecurring'] });
    qc.invalidateQueries({ queryKey: ['active-time-entry'] });
  };

  const start = useMutation({
    mutationFn: ({ task, userId }: { task: PlanningTask; userId: string }) =>
      planningTimeService.startSessionForTask(task, userId),
    onSuccess: (_data, vars) => {
      invalidate(vars.task.id);
      toast.success('Session démarrée');
    },
    onError: mapErrorToast,
  });

  const resume = useMutation({
    mutationFn: ({ task, userId }: { task: PlanningTask; userId: string }) =>
      planningTimeService.resumeSessionForTask(task, userId),
    onSuccess: (_data, vars) => {
      invalidate(vars.task.id);
      toast.success('Session reprise');
    },
    onError: mapErrorToast,
  });

  const pause = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      planningTimeService.pauseSessionForTask(taskId),
    onMutate: async ({ taskId }) => {
      await qc.cancelQueries({ queryKey: ['task-time-stats', taskId] });
      const prev = qc.getQueryData<TaskTimeStats>(['task-time-stats', taskId]);
      if (prev) {
        // Optimistic : on fige le compteur, on désactive le polling immédiatement.
        const extraMs = prev.activeStartTime
          ? Math.max(0, Date.now() - new Date(prev.activeStartTime).getTime())
          : 0;
        qc.setQueryData<TaskTimeStats>(['task-time-stats', taskId], {
          ...prev,
          totalSeconds: prev.totalSeconds + Math.floor(extraMs / 1000),
          hasActive: false,
          activeSessionId: null,
          activeStartTime: null,
        });
      }
      return { prev };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['task-time-stats', vars.taskId], ctx.prev);
      mapErrorToast(err);
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.taskId);
      toast.success('Session mise en pause');
    },
  });

  const complete = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      planningTimeService.completeTaskWithSession(taskId),
    onMutate: async ({ taskId }) => {
      await qc.cancelQueries({ queryKey: ['task-time-stats', taskId] });
      const prev = qc.getQueryData<TaskTimeStats>(['task-time-stats', taskId]);
      if (prev) {
        qc.setQueryData<TaskTimeStats>(['task-time-stats', taskId], {
          ...prev,
          hasActive: false,
          activeSessionId: null,
          activeStartTime: null,
        });
      }
      return { prev };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['task-time-stats', vars.taskId], ctx.prev);
      mapErrorToast(err);
    },
    onSuccess: (_data, vars) => {
      invalidate(vars.taskId);
      toast.success('Tâche terminée');
    },
  });

  const unblock = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      planningTimeService.unblockTask(taskId),
    onSuccess: (_data, vars) => {
      invalidate(vars.taskId);
      toast.success('Tâche débloquée');
    },
    onError: mapErrorToast,
  });

  return { start, resume, pause, complete, unblock };
}