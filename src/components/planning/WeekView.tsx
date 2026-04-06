
import React, { useState } from 'react';
import { PlanningStatus } from '@/services/planning/planningService';
import { TaskCard } from './TaskCard';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function WeekView({ farmId }: WeekViewProps) {
  const { start, end } = getWeekRange();
  const { tasks, doneTasks, isLoading, updateStatus, postponeTask, deleteTask } = usePlanningTasks(farmId, start, end);
  const [doneOpen, setDoneOpen] = useState(false);

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

  const monday = new Date(start);
  const todayStr = new Date().toISOString().split('T')[0];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const activeTasks = tasks.filter(t => t.status !== 'done');

  return (
    <div className="space-y-1">
      {days.map((dateStr, i) => {
        const dayTasks = activeTasks.filter(t => t.due_date === dateStr);
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;

        // Hide past days with no tasks
        if (isPast && dayTasks.length === 0) return null;

        const dateObj = new Date(dateStr + 'T12:00:00');
        const dayNum = dateObj.getDate();
        const monthName = monthNames[dateObj.getMonth()];
        const label = `${dayNames[i]} ${dayNum} ${monthName}`;

        return (
          <React.Fragment key={dateStr}>
            <div className={`rounded-lg px-3 py-3 ${isToday ? 'bg-primary/10 border border-primary/20' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    isToday 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {dayNum}
                  </span>
                  <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {isToday ? `${dayNames[i]} — Aujourd'hui` : `${dayNames[i]} ${monthName}`}
                  </span>
                </div>
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayTasks.length}
                  </Badge>
                )}
              </div>

              {dayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 pl-10 italic">— Aucune tâche</p>
              ) : (
                <div className="space-y-2 pl-1">
                  {dayTasks.map(task => (
                    <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
            {i < 6 && <Separator className="my-1 opacity-40" />}
          </React.Fragment>
        );
      })}

      {doneTasks.length > 0 && (
        <>
          <Separator className="my-2" />
          <Collapsible open={doneOpen} onOpenChange={setDoneOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <ChevronDown className={`h-4 w-4 transition-transform ${doneOpen ? 'rotate-0' : '-rotate-90'}`} />
              ✅ Terminées
              <Badge variant="outline" className="ml-auto text-xs">{doneTasks.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2 px-1">
              {doneTasks.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onPostpone={handlePostpone} onDelete={handleDelete} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
