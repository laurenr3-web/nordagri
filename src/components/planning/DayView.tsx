
import React, { useState, useMemo } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { TaskGroup } from './TaskGroup';
import { TaskDetailDialog } from './TaskDetailDialog';
import { AddTaskForm } from './AddTaskForm';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { MaintenanceSuggestions } from './MaintenanceSuggestions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DayViewProps {
  farmId: string | null;
  date: string;
  label: string;
  teamMembers: { id: string; name: string; userId?: string }[];
  userId?: string | null;
  taskFilter?: (task: PlanningTask) => boolean;
}

export function DayView({ farmId, date, label, teamMembers, userId, taskFilter }: DayViewProps) {
  const { groupedTasks, overdueTasks, isLoading, updateStatus, updateTask, postponeTask, deleteTask } = usePlanningTasks(farmId, date, date);
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);
  const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipmentList', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data } = await supabase.from('equipment').select('id, name').eq('farm_id', farmId);
      return data || [];
    },
    enabled: !!farmId,
  });

  const currentUserMemberId = useMemo(() => {
    if (!userId) return null;
    return teamMembers.find(m => (m as any).userId === userId)?.id ?? null;
  }, [userId, teamMembers]);

  const applyFilter = (tasks: PlanningTask[]) => taskFilter ? tasks.filter(taskFilter) : tasks;

  const handleStatusChange = (id: string, status: PlanningStatus) => {
    updateStatus.mutate({ id, status });
  };
  const handlePostpone = (id: string, newDate: string) => {
    postponeTask.mutate({ id, newDate });
  };
  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };
  const handleUpdate = (id: string, updates: Partial<PlanningTask>) => {
    updateTask.mutate({ id, updates });
  };
  const handleAssign = (taskId: string, memberId: string | null) => {
    updateTask.mutate({ id: taskId, updates: { assigned_to: memberId } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const filteredGrouped = {
    critical: applyFilter(groupedTasks.critical),
    important: applyFilter(groupedTasks.important),
    todo: applyFilter(groupedTasks.todo),
  };
  const filteredOverdue = applyFilter(overdueTasks);

  const totalTasks = filteredGrouped.critical.length + filteredGrouped.important.length + filteredGrouped.todo.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = date === todayStr;

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleSwipeComplete = (id: string) => {
    updateStatus.mutate({ id, status: 'done' });
  };
  const handleSwipePostpone = (id: string) => {
    postponeTask.mutate({ id, newDate: tomorrowStr });
  };

  const assignProps = { teamMembers, currentUserMemberId, onAssign: handleAssign, onComplete: handleSwipeComplete, onPostpone: handleSwipePostpone };

  return (
    <div className="space-y-4">
      {isToday && filteredOverdue.length > 0 && (
        <TaskGroup label="En retard" icon="⏰" tasks={filteredOverdue} onTaskClick={setSelectedTask} {...assignProps} />
      )}

      {isToday && <MaintenanceSuggestions farmId={farmId} userId={userId ?? null} />}

      {totalTasks === 0 && (!isToday || filteredOverdue.length === 0) ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">🎉</p>
          <p className="text-sm mt-2">Aucune tâche pour {label.toLowerCase()}</p>
        </div>
      ) : (
        <>
          <TaskGroup label="Critique" icon="🔴" tasks={filteredGrouped.critical} onTaskClick={setSelectedTask} {...assignProps} />
          <TaskGroup label="Important" icon="🟡" tasks={filteredGrouped.important} onTaskClick={setSelectedTask} {...assignProps} />
          <TaskGroup label="À faire" icon="⚪" tasks={filteredGrouped.todo} onTaskClick={setSelectedTask} {...assignProps} />
        </>
      )}

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
        teamMembers={teamMembers}
        onStatusChange={handleStatusChange}
        onPostpone={handlePostpone}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onEdit={(t) => setEditingTask(t)}
      />

      <AddTaskForm
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        teamMembers={teamMembers}
        equipment={equipment as any[]}
        onSubmit={(updates) => {
          if (!editingTask) return;
          updateTask.mutate({
            id: editingTask.id,
            updates: {
              ...updates,
              assigned_to: (updates.assigned_to === 'none' || !updates.assigned_to) ? null : updates.assigned_to,
              equipment_id: updates.equipment_id && (updates.equipment_id as any) !== 'none' ? updates.equipment_id : null,
              manual_priority: updates.manual_priority === ('auto' as any) ? null : updates.manual_priority,
            } as any,
          });
          setEditingTask(null);
        }}
      />
    </div>
  );
}
