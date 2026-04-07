
import React, { useState, useMemo } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { useAuthContext } from '@/providers/AuthProvider';
import { User, Users } from 'lucide-react';

interface EmployeeViewProps {
  farmId: string | null;
  date: string;
  teamMembers: { id: string; name: string; userId?: string }[];
}

interface EmployeeGroup {
  id: string | null;
  name: string;
  tasks: PlanningTask[];
}

export function EmployeeView({ farmId, date, teamMembers }: EmployeeViewProps) {
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);
  const { tasks, isLoading, updateStatus, postponeTask, deleteTask, updateTask } =
    usePlanningTasks(farmId, date, date);
  const { user } = useAuthContext();

  const currentUserMemberId = useMemo(() => {
    if (!user) return null;
    return teamMembers.find(m => (m as any).userId === user.id)?.id ?? null;
  }, [user, teamMembers]);

  const activeTasks = tasks.filter(t => t.status !== 'done');

  const priorityOrder: Record<string, number> = { critical: 0, important: 1, todo: 2 };

  const groupMap = new Map<string | null, PlanningTask[]>();
  for (const task of activeTasks) {
    const key = task.assigned_to;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(task);
  }

  const sortByPriority = (a: PlanningTask, b: PlanningTask) => {
    const pa = a.manual_priority || a.computed_priority;
    const pb = b.manual_priority || b.computed_priority;
    return (priorityOrder[pa] ?? 2) - (priorityOrder[pb] ?? 2);
  };

  const groups: EmployeeGroup[] = [];

  for (const member of teamMembers) {
    const memberTasks = groupMap.get(member.id);
    if (memberTasks && memberTasks.length > 0) {
      groups.push({
        id: member.id,
        name: member.name,
        tasks: memberTasks.sort(sortByPriority),
      });
    }
  }

  const unassigned = groupMap.get(null);
  if (unassigned && unassigned.length > 0) {
    groups.push({
      id: null,
      name: 'Non assigné',
      tasks: unassigned.sort(sortByPriority),
    });
  }

  const handleStatusChange = (id: string, status: PlanningStatus) => {
    updateStatus.mutate({ id, status });
  };
  const handlePostpone = (id: string, newDate: string) => {
    postponeTask.mutate({ id, newDate });
  };
  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
    setSelectedTask(null);
  };
  const handleUpdate = (id: string, updates: Partial<PlanningTask>) => {
    updateTask.mutate({ id, updates });
  };
  const handleAssign = (taskId: string, memberId: string | null) => {
    updateTask.mutate({ id: taskId, updates: { assigned_to: memberId } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">
        Aucune tâche active pour aujourd'hui
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group.id ?? '_unassigned'} className="space-y-2">
          <div className="flex items-center gap-2">
            {group.id ? (
              <User className="h-4 w-4 text-primary" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              {group.name}
            </h3>
            <span className="text-xs text-muted-foreground font-normal">
              ({group.tasks.length} tâche{group.tasks.length > 1 ? 's' : ''})
            </span>
          </div>
          <div className="space-y-2">
            {group.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
                teamMembers={teamMembers}
                currentUserMemberId={currentUserMemberId}
                onAssign={handleAssign}
              />
            ))}
          </div>
        </div>
      ))}

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
        teamMembers={teamMembers}
        onStatusChange={handleStatusChange}
        onPostpone={handlePostpone}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
