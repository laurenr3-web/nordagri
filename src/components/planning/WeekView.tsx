
import React, { useState, useMemo } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { SwipeableTaskCard } from './SwipeableTaskCard';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/providers/AuthProvider';

interface WeekViewProps {
  farmId: string | null;
  teamMembers: { id: string; name: string; userId?: string }[];
  taskFilter?: (task: PlanningTask) => boolean;
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

export function WeekView({ farmId, teamMembers, taskFilter }: WeekViewProps) {
  const { start, end } = getWeekRange();
  const { tasks, doneTasks, isLoading, updateStatus, updateTask, postponeTask, deleteTask } = usePlanningTasks(farmId, start, end);
  const [doneOpen, setDoneOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);
  const { user } = useAuthContext();

  const currentUserMemberId = useMemo(() => {
    if (!user) return null;
    return teamMembers.find(m => (m as any).userId === user.id)?.id ?? null;
  }, [user, teamMembers]);

  const applyFilter = (list: PlanningTask[]) => taskFilter ? list.filter(taskFilter) : list;

  const handleStatusChange = (id: string, status: PlanningStatus) => { updateStatus.mutate({ id, status }); };
  const handlePostpone = (id: string, newDate: string) => { postponeTask.mutate({ id, newDate }); };
  const handleDelete = (id: string) => { deleteTask.mutate(id); };
  const handleUpdate = (id: string, updates: Partial<PlanningTask>) => { updateTask.mutate({ id, updates }); };
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

  const monday = new Date(start);
  const todayStr = new Date().toISOString().split('T')[0];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const activeTasks = applyFilter(tasks.filter(t => t.status !== 'done'));
  const filteredDone = applyFilter(doneTasks);

  return (
    <div className="space-y-1">
      {days.map((dateStr, i) => {
        const dayTasks = activeTasks.filter(t => t.due_date === dateStr);
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;

        if (isPast && dayTasks.length === 0) return null;

        const dateObj = new Date(dateStr + 'T12:00:00');
        const dayNum = dateObj.getDate();
        const monthName = monthNames[dateObj.getMonth()];

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
              )}
            </div>
            {i < 6 && <Separator className="my-1 opacity-40" />}
          </React.Fragment>
        );
      })}

      {filteredDone.length > 0 && (
        <>
          <Separator className="my-2" />
          <Collapsible open={doneOpen} onOpenChange={setDoneOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <ChevronDown className={`h-4 w-4 transition-transform ${doneOpen ? 'rotate-0' : '-rotate-90'}`} />
              ✅ Terminées
              <Badge variant="outline" className="ml-auto text-xs">{filteredDone.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2 px-1">
              {filteredDone.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} teamMembers={teamMembers} />
              ))}
            </CollapsibleContent>
          </Collapsible>
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
      />
    </div>
  );
}
