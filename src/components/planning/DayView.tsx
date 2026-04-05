
import React from 'react';
import { PlanningStatus } from '@/services/planning/planningService';
import { TaskGroup } from './TaskGroup';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';

interface DayViewProps {
  farmId: string | null;
  date: string; // YYYY-MM-DD
  label: string;
}

export function DayView({ farmId, date, label }: DayViewProps) {
  const { groupedTasks, isLoading, updateStatus, postponeTask, deleteTask } = usePlanningTasks(farmId, date, date);

  const handleStatusChange = (id: string, status: PlanningStatus) => {
    updateStatus.mutate({ id, status });
  };

  const handlePostpone = (id: string) => {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    postponeTask.mutate({ id, newDate: tomorrow.toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const totalTasks = groupedTasks.critical.length + groupedTasks.important.length + groupedTasks.todo.length;

  return (
    <div className="space-y-4">
      {totalTasks === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">🎉</p>
          <p className="text-sm mt-2">Aucune tâche pour {label.toLowerCase()}</p>
        </div>
      ) : (
        <>
          <TaskGroup
            label="Critique"
            icon="🔴"
            tasks={groupedTasks.critical}
            onStatusChange={handleStatusChange}
            onPostpone={handlePostpone}
            onDelete={handleDelete}
          />
          <TaskGroup
            label="Important"
            icon="🟡"
            tasks={groupedTasks.important}
            onStatusChange={handleStatusChange}
            onPostpone={handlePostpone}
            onDelete={handleDelete}
          />
          <TaskGroup
            label="À faire"
            icon="⚪"
            tasks={groupedTasks.todo}
            onStatusChange={handleStatusChange}
            onPostpone={handlePostpone}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
