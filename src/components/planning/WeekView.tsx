
import React from 'react';
import { PlanningStatus } from '@/services/planning/planningService';
import { TaskGroup } from './TaskGroup';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';

interface WeekViewProps {
  farmId: string | null;
}

function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function WeekView({ farmId }: WeekViewProps) {
  const { start, end } = getWeekRange();
  const { tasks, isLoading, updateStatus, postponeTask, deleteTask } = usePlanningTasks(farmId, start, end);

  const handleStatusChange = (id: string, status: PlanningStatus) => {
    updateStatus.mutate({ id, status });
  };

  const handlePostpone = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextDay = new Date(task.due_date);
    nextDay.setDate(nextDay.getDate() + 1);
    postponeTask.mutate({ id, newDate: nextDay.toISOString().split('T')[0] });
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

  // Group by day
  const monday = new Date(start);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      {days.map((dateStr, i) => {
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const dateObj = new Date(dateStr);
        const label = `${dayNames[i]} ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

        return (
          <div key={dateStr} className="space-y-2">
            <h3 className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {isToday ? `📍 ${label} (Aujourd'hui)` : label}
            </h3>
            {dayTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-2">Aucune tâche</p>
            ) : (
              <div className="space-y-2">
                {dayTasks.map(task => (
                  <TaskGroup
                    key={task.id}
                    label=""
                    icon=""
                    tasks={[task]}
                    onStatusChange={handleStatusChange}
                    onPostpone={handlePostpone}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
