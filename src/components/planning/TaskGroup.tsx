
import React from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { TaskCard } from './TaskCard';

interface TaskGroupProps {
  label: string;
  icon: string;
  tasks: PlanningTask[];
  onStatusChange: (id: string, status: PlanningStatus) => void;
  onPostpone: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskGroup({ label, icon, tasks, onStatusChange, onPostpone, onDelete }: TaskGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
        <span>{icon}</span> {label}
        <span className="text-xs font-normal">({tasks.length})</span>
      </h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onPostpone={onPostpone}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
