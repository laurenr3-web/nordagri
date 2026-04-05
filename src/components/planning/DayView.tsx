
import React, { useState } from 'react';
import { PlanningStatus } from '@/services/planning/planningService';
import { TaskGroup } from './TaskGroup';
import { TaskCard } from './TaskCard';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface DayViewProps {
  farmId: string | null;
  date: string;
  label: string;
}

export function DayView({ farmId, date, label }: DayViewProps) {
  const { groupedTasks, doneTasks, isLoading, updateStatus, postponeTask, deleteTask } = usePlanningTasks(farmId, date, date);
  const [doneOpen, setDoneOpen] = useState(false);

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
          <TaskGroup label="Critique" icon="🔴" tasks={groupedTasks.critical} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
          <TaskGroup label="Important" icon="🟡" tasks={groupedTasks.important} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
          <TaskGroup label="À faire" icon="⚪" tasks={groupedTasks.todo} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
        </>
      )}

      {doneTasks.length > 0 && (
        <Collapsible open={doneOpen} onOpenChange={setDoneOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-4 w-4 transition-transform ${doneOpen ? 'rotate-0' : '-rotate-90'}`} />
            ✅ Terminées ({doneTasks.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
