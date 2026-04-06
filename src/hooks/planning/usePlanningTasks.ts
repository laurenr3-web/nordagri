
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, PlanningStatus, PlanningCategory, PlanningPriority } from '@/services/planning/planningService';
import { toast } from 'sonner';
import { useCategoryImportance } from './useCategoryImportance';

export function usePlanningTasks(farmId: string | null, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient();
  const { importanceMap } = useCategoryImportance(farmId);

  const queryKey = ['planningTasks', farmId, startDate, endDate];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => planningService.getTasks(farmId!, startDate, endDate),
    enabled: !!farmId,
  });

  const getComputedPriority = (category: PlanningCategory): PlanningPriority => {
    return importanceMap[category] || 'todo';
  };

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
    }) => planningService.addTask({
      ...task,
      farm_id: farmId!,
      computed_priority: getComputedPriority(task.category),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      toast.success('Tâche ajoutée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanningStatus }) =>
      planningService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const postponeTask = useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      planningService.postponeTask(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      toast.success('Tâche reportée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => planningService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      toast.success('Tâche supprimée');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PlanningTask> }) =>
      planningService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
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

  return {
    tasks: sortedTasks,
    groupedTasks,
    doneTasks,
    isLoading,
    addTask,
    updateStatus,
    updateTask,
    postponeTask,
    deleteTask,
    getComputedPriority,
  };
}
