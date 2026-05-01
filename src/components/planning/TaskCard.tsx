
import React, { useState } from 'react';
import { PlanningTask } from '@/services/planning/planningService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Wrench, User, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskTimeBadge } from './TaskTimeBadge';
import { TaskTimeControls } from './TaskTimeControls';
import { useTaskTimeStats } from '@/hooks/planning/usePlanningTaskTime';
import { useAuthContext } from '@/providers/AuthProvider';

const categoryLabels: Record<string, string> = {
  animaux: '🐄 Animaux',
  champs: '🌾 Champs',
  alimentation: '🥩 Alimentation',
  equipement: '🚜 Équipement',
  batiment: '🏠 Bâtiment',
  administration: '📋 Administration',
  autre: '📌 Autre',
};

const statusLabels: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  paused: 'En pause',
  done: 'Terminé',
  blocked: 'Bloqué',
};

const statusColors: Record<string, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  important: { label: 'Important', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  todo: { label: 'À faire', className: 'bg-muted text-muted-foreground' },
};

interface TaskCardProps {
  task: PlanningTask;
  onClick?: () => void;
  teamMembers?: { id: string; name: string; userId?: string; legacyMemberId?: string }[];
  currentUserMemberId?: string | null;
  onAssign?: (taskId: string, memberId: string | null) => void;
}

export function TaskCard({ task, onClick, teamMembers, currentUserMemberId, onAssign }: TaskCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { user } = useAuthContext();
  const effectivePriority = task.manual_priority || task.computed_priority;
  const priority = priorityConfig[effectivePriority] || priorityConfig.todo;

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date < todayStr && task.status !== 'done';
  const overdueDays = isOverdue
    ? Math.floor((new Date(todayStr).getTime() - new Date(task.due_date).getTime()) / 86400000)
    : 0;

  const assignedMemberName = task.assigned_to && teamMembers
    ? teamMembers.find(m => m.id === task.assigned_to || m.userId === task.assigned_to || m.legacyMemberId === task.assigned_to)?.name
    : task.team_member_name;

  const isUnassigned = !task.assigned_to;
  const canAssign = !!onAssign && !!teamMembers && task.status !== 'done';

  // Time-tracking : on n'active la requête que pour les tâches RÉELLES (pas les
  // occurrences récurrentes virtuelles, qui n'ont pas de sessions liées).
  const enableTimeTracking = task.status !== 'done' && !task.is_recurring;
  const { data: timeStats } = useTaskTimeStats(enableTimeTracking ? task.id : null);

  const handleAssign = (memberId: string | null) => {
    onAssign?.(task.id, memberId);
    setPopoverOpen(false);
  };

  const handleTake = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUserMemberId) {
      onAssign?.(task.id, currentUserMemberId);
    }
  };

  return (
    <Card
      className={cn(
        "p-3 space-y-1 cursor-pointer hover:shadow-md transition-shadow",
        task.status === 'done' && "opacity-60",
        isOverdue && "border-orange-400 dark:border-orange-600"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {task.is_recurring && (
            <RefreshCw className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <h4 className={cn(
            "font-semibold text-sm leading-tight",
            task.status === 'done' && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
        </div>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", priority.className)}>
          {priority.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
        <span>{categoryLabels[task.category] || task.category}</span>
        <span className="opacity-50">·</span>
        <span className={cn(
          task.status === 'in_progress' && "text-blue-600 dark:text-blue-400 font-medium",
          task.status === 'paused' && "text-amber-600 dark:text-amber-400 font-medium",
          task.status === 'blocked' && "text-red-600 dark:text-red-400 font-medium",
        )}>
          {statusLabels[task.status]}
        </span>
        {enableTimeTracking && timeStats && (timeStats.sessionCount > 0 || timeStats.hasActive) && (
          <>
            <span className="opacity-50">·</span>
            <TaskTimeBadge stats={timeStats} inline />
          </>
        )}
        {assignedMemberName && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 gap-1"
          >
            <User className="h-2.5 w-2.5" />
            {assignedMemberName}
          </Badge>
        )}
        {isOverdue && (
          <Badge className="text-[10px] px-1.5 py-0 bg-orange-500 text-white border-0 gap-1">
            <Clock className="h-2.5 w-2.5" />
            {overdueDays}j en retard
          </Badge>
        )}
        {task.source_module === 'maintenance' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700 gap-1">
            <Wrench className="h-2.5 w-2.5" />
            Maintenance
          </Badge>
        )}
      </div>

      {task.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
      )}

      {(isUnassigned || enableTimeTracking) && (
        <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
          {isUnassigned && (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <>
                {canAssign ? (
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1.5 h-8 text-xs px-2 rounded-md transition-colors text-muted-foreground bg-muted/50 hover:bg-muted">
                        <User className="h-3 w-3" />
                        Non assignée
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      <div className="space-y-0.5">
                        <button
                          className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors bg-muted font-medium"
                          onClick={() => handleAssign(null)}
                        >
                          Non assignée
                        </button>
                        {teamMembers!.map(member => (
                          <button
                            key={member.id}
                            className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            onClick={() => handleAssign(member.id)}
                          >
                            {member.name}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Non assignée
                  </span>
                )}

                {canAssign && currentUserMemberId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-2 gap-1"
                    onClick={handleTake}
                  >
                    <Hand className="h-3 w-3" />
                    Prendre
                  </Button>
                )}
              </>
            </div>
          )}
          {enableTimeTracking && (
            <div className="flex justify-end">
              <TaskTimeControls task={task} userId={user?.id ?? null} variant="card" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
