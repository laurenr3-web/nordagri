
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, PlanningTask, PlanningStatus, PlanningCategory, PlanningPriority } from '@/services/planning/planningService';
import { toast } from 'sonner';
import { useCategoryImportance } from './useCategoryImportance';
import { useAuthContext } from '@/providers/AuthProvider';

/** Check if a recurring task should appear on a given date */
function shouldAppearOnDate(task: PlanningTask, dateStr: string): boolean {
  if (!task.is_recurring || !task.recurrence_type) return false;

  const target = new Date(dateStr + 'T00:00:00');
  const created = new Date(task.due_date + 'T00:00:00');

  // Don't show before the original due_date
  if (target < created) return false;

  switch (task.recurrence_type) {
    case 'daily':
      return true;
    case 'weekly':
      return target.getDay() === created.getDay();
    case 'custom':
      return (task.recurrence_days || []).includes(target.getDay());
    default:
      return false;
  }
}

/** Generate all dates between start and end (inclusive) */
function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + 'T00:00:00');
  const endD = new Date(end + 'T00:00:00');
  while (d <= endD) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function usePlanningTasks(farmId: string | null, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient();
  const { importanceMap } = useCategoryImportance(farmId);
  const { user } = useAuthContext();

  const queryKey = ['planningTasks', farmId, startDate, endDate];

  const { data: rawTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey,
    queryFn: () => planningService.getTasks(farmId!, startDate, endDate),
    enabled: !!farmId,
  });

  // Fetch overdue tasks (due_date < today, status != done)
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: overdueTasks = [] } = useQuery({
    queryKey: ['planningOverdue', farmId, todayStr],
    queryFn: () => planningService.getOverdueTasks(farmId!, todayStr),
    enabled: !!farmId,
  });

  // Also fetch recurring tasks that were created before the date range
  const { data: recurringTasks = [] } = useQuery({
    queryKey: ['planningRecurring', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase
        .from('planning_tasks')
        .select('*')
        .eq('farm_id', farmId)
        .eq('is_recurring', true)
        .neq('status', 'done');
      if (error) throw error;
      return ((data || []) as any[]).map(t => ({ ...t, team_member_name: null })) as PlanningTask[];
    },
    enabled: !!farmId,
  });

  // Fetch completions for the date range + overdue window (past 7 days)
  const allRecurringIds = recurringTasks.map(t => t.id);
  const overdueStartStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();
  const completionsStart = startDate && startDate < overdueStartStr ? startDate : overdueStartStr;
  const completionsEnd = endDate && endDate > todayStr ? endDate : todayStr;

  const { data: completions = [] } = useQuery({
    queryKey: ['planningCompletions', farmId, completionsStart, completionsEnd, allRecurringIds.length],
    queryFn: () => planningService.getCompletions(allRecurringIds, completionsStart, completionsEnd),
    enabled: !!farmId && allRecurringIds.length > 0,
  });

  const completionSet = new Set(completions.map((c: any) => `${c.task_id}_${c.completion_date}`));

  const getComputedPriority = (category: PlanningCategory): PlanningPriority => {
    return importanceMap[category] || 'todo';
  };

  // Build the final task list: regular tasks + recurring occurrences
  const buildTaskList = (): PlanningTask[] => {
    const result: PlanningTask[] = [];
    const seenRecurringOnDate = new Set<string>();

    // Add non-recurring tasks as-is
    for (const t of rawTasks) {
      if (!t.is_recurring) {
        result.push(t);
      } else {
        // The original occurrence — mark with its due_date
        const key = `${t.id}_${t.due_date}`;
        if (!seenRecurringOnDate.has(key)) {
          seenRecurringOnDate.add(key);
          const isCompleted = completionSet.has(key);
          result.push({
            ...t,
            _occurrence_date: t.due_date,
            _is_completed_today: isCompleted,
            status: isCompleted ? 'done' : t.status === 'done' ? 'todo' : t.status,
          });
        }
      }
    }

    // Generate virtual occurrences for recurring tasks
    if (startDate && endDate) {
      const dates = getDatesInRange(startDate, endDate);
      for (const task of recurringTasks) {
        for (const date of dates) {
          const key = `${task.id}_${date}`;
          if (seenRecurringOnDate.has(key)) continue;

          if (shouldAppearOnDate(task, date)) {
            seenRecurringOnDate.add(key);
            const isCompleted = completionSet.has(key);
            result.push({
              ...task,
              due_date: date,
              _occurrence_date: date,
              _is_completed_today: isCompleted,
              status: isCompleted ? 'done' : 'todo',
            });
          }
        }
      }
    }

    return result;
  };

  const tasks = buildTaskList();
  const isLoading = tasksLoading;

  const addTask = useMutation({
    mutationFn: (task: {
      title: string;
      category: PlanningCategory;
      due_date: string;
      created_by: string;
      manual_priority?: PlanningPriority | null;
      assigned_to?: string | null;
      notes?: string | null;
      equipment_id?: number | null;
      field_name?: string | null;
      building_name?: string | null;
      animal_group?: string | null;
      is_recurring?: boolean;
      recurrence_type?: string | null;
      recurrence_days?: number[] | null;
    }) => planningService.addTask({
      ...task,
      farm_id: farmId!,
      computed_priority: getComputedPriority(task.category),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningRecurring'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      toast.success('Tâche ajoutée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PlanningStatus }) => {
      const task = tasks.find(t => t.id === id);
      if (task?.is_recurring && task._occurrence_date && user) {
        if (status === 'done') {
          await planningService.markRecurringComplete(id, task._occurrence_date, user.id);
        } else if (status === 'todo') {
          await planningService.unmarkRecurringComplete(id, task._occurrence_date);
        }
        // Also update base task status for in_progress/blocked so it's reflected
        if (status !== 'done') {
          await planningService.updateTaskStatus(id, status);
        }
      } else {
        await planningService.updateTaskStatus(id, status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningCompletions'] });
      queryClient.invalidateQueries({ queryKey: ['planningRecurring'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const postponeTask = useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      planningService.postponeTask(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      toast.success('Tâche reportée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => planningService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningRecurring'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      toast.success('Tâche supprimée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PlanningTask> }) =>
      planningService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningRecurring'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      toast.success('Tâche mise à jour');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Sort tasks: priority order (critical > important > todo), then by date
  const priorityOrder: Record<string, number> = { critical: 0, important: 1, todo: 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    const pa = a.manual_priority || a.computed_priority;
    const pb = b.manual_priority || b.computed_priority;
    const diff = (priorityOrder[pa] ?? 2) - (priorityOrder[pb] ?? 2);
    if (diff !== 0) return diff;
    return a.due_date.localeCompare(b.due_date);
  });

  const activeTasks = sortedTasks.filter(t => t.status !== 'done');
  const doneTasks = sortedTasks.filter(t => t.status === 'done');

  const groupedTasks = {
    critical: activeTasks.filter(t => (t.manual_priority || t.computed_priority) === 'critical'),
    important: activeTasks.filter(t => (t.manual_priority || t.computed_priority) === 'important'),
    todo: activeTasks.filter(t => (t.manual_priority || t.computed_priority) === 'todo'),
  };

  // Sort overdue by date ascending (oldest first)
  // Include non-recurring overdue tasks
  const overdueNonRecurring = [...overdueTasks]
    .filter(t => t.status !== 'done');

  // Build overdue recurring occurrences (past 7 days, not completed)
  const overdueRecurring: PlanningTask[] = [];
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();
  const overdueDates = getDatesInRange(overdueStartStr, yesterdayStr);
  for (const task of recurringTasks) {
    for (const date of overdueDates) {
      if (shouldAppearOnDate(task, date)) {
        const key = `${task.id}_${date}`;
        if (!completionSet.has(key)) {
          overdueRecurring.push({
            ...task,
            due_date: date,
            _occurrence_date: date,
            _is_completed_today: false,
            status: 'todo',
          });
        }
      }
    }
  }

  const sortedOverdue = [...overdueNonRecurring, ...overdueRecurring]
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return {
    tasks: sortedTasks,
    groupedTasks,
    doneTasks,
    overdueTasks: sortedOverdue,
    isLoading,
    addTask,
    updateStatus,
    updateTask,
    postponeTask,
    deleteTask,
    getComputedPriority,
  };
}
