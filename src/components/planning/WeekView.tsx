
import React, { useState, useMemo } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { SwipeableTaskCard } from './SwipeableTaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { AddTaskForm } from './AddTaskForm';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { todayLocal, tomorrowLocal, localDateStr } from '@/lib/dateLocal';


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
    start: localDateStr(monday),
    end: localDateStr(sunday),
  };
}

const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function WeekView({ farmId, teamMembers, taskFilter }: WeekViewProps) {
  const { start, end } = getWeekRange();
  const { tasks, isLoading, updateStatus, updateTask, postponeTask, deleteTask } = usePlanningTasks(farmId, start, end);
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);
  const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);
  const { user } = useAuthContext();

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
  const tomorrowStr = tomorrowLocal();
  const handleSwipeComplete = (id: string) => { updateStatus.mutate({ id, status: 'done' }); };
  const handleSwipePostpone = (id: string) => { postponeTask.mutate({ id, newDate: tomorrowStr }); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const monday = new Date(start);
  const todayStr = todayLocal();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return localDateStr(d);
  });

  const activeTasks = applyFilter(tasks.filter(t => t.status !== 'done'));

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
                    <SwipeableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                      teamMembers={teamMembers}
                      currentUserMemberId={currentUserMemberId}
                      onAssign={handleAssign}
                      onComplete={handleSwipeComplete}
                      onPostpone={handleSwipePostpone}
                    />
                  ))}
                </div>
              )}
            </div>
            {i < 6 && <Separator className="my-1 opacity-40" />}
          </React.Fragment>
        );
      })}

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
