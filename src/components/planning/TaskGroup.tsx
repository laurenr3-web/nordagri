
import React from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { TaskCard } from './TaskCard';

interface TaskGroupProps {
  label: string;
  icon: string;
  tasks: PlanningTask[];
  onTaskClick?: (task: PlanningTask) => void;
  teamMembers?: { id: string; name: string }[];
  currentUserMemberId?: string | null;
  onAssign?: (taskId: string, memberId: string | null) => void;
  onStatusChange?: (taskId: string, status: PlanningStatus) => void;
  onPostpone?: (taskId: string, newDate: string) => void;
}

export function TaskGroup({ label, icon, tasks, onTaskClick, teamMembers, currentUserMemberId, onAssign, onStatusChange, onPostpone }: TaskGroupProps) {
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
            onClick={() => onTaskClick?.(task)}
            teamMembers={teamMembers}
            currentUserMemberId={currentUserMemberId}
            onAssign={onAssign}
            onStatusChange={onStatusChange}
            onPostpone={onPostpone}
          />
        ))}
      </div>
    </div>
  );
}
