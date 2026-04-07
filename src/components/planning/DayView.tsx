
import React, { useState } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { TaskGroup } from './TaskGroup';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { MaintenanceSuggestions } from './MaintenanceSuggestions';

interface DayViewProps {
  farmId: string | null;
  date: string;
  label: string;
  teamMembers: { id: string; name: string }[];
  userId?: string | null;
  taskFilter?: (task: PlanningTask) => boolean;
}

export function DayView({ farmId, date, label, teamMembers, userId, taskFilter }: DayViewProps) {
  const { groupedTasks, doneTasks, overdueTasks, isLoading, updateStatus, updateTask, postponeTask, deleteTask } = usePlanningTasks(farmId, date, date);
  const [doneOpen, setDoneOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);

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
  const filteredDone = applyFilter(doneTasks);
  const filteredOverdue = applyFilter(overdueTasks);

  const totalTasks = filteredGrouped.critical.length + filteredGrouped.important.length + filteredGrouped.todo.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = date === todayStr;

  return (
    <div className="space-y-4">
      {/* Overdue section — only on Today view */}
      {isToday && filteredOverdue.length > 0 && (
        <TaskGroup label="En retard" icon="⏰" tasks={filteredOverdue} onTaskClick={setSelectedTask} />
      )}

      {/* Maintenance suggestions — only on Today view */}
      {isToday && <MaintenanceSuggestions farmId={farmId} userId={userId ?? null} />}

      {totalTasks === 0 && (!isToday || filteredOverdue.length === 0) ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">🎉</p>
          <p className="text-sm mt-2">Aucune tâche pour {label.toLowerCase()}</p>
        </div>
      ) : (
        <>
          <TaskGroup label="Critique" icon="🔴" tasks={filteredGrouped.critical} onTaskClick={setSelectedTask} />
          <TaskGroup label="Important" icon="🟡" tasks={filteredGrouped.important} onTaskClick={setSelectedTask} />
          <TaskGroup label="À faire" icon="⚪" tasks={filteredGrouped.todo} onTaskClick={setSelectedTask} />
        </>
      )}

      {filteredDone.length > 0 && (
        <Collapsible open={doneOpen} onOpenChange={setDoneOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-4 w-4 transition-transform ${doneOpen ? 'rotate-0' : '-rotate-90'}`} />
            ✅ Terminées ({filteredDone.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {filteredDone.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
            ))}
          </CollapsibleContent>
        </Collapsible>
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
      />
    </div>
  );
}
