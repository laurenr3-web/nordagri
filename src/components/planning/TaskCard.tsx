
import React, { useState } from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Wrench, User, Hand, Check, Play, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  animaux: '🐄 Animaux',
  champs: '🌾 Champs',
  alimentation: '🥩 Alimentation',
  equipement: '🚜 Équipement',
  batiment: '🏠 Bâtiment',
  administration: '📋 Administration',
  autre: '📌 Autre',
};

const priorityConfig: Record<string, { label: string; border: string; bg: string; badge: string }> = {
  critical: {
    label: 'Critique',
    border: 'border-l-4 border-l-red-500',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  important: {
    label: 'Important',
    border: 'border-l-4 border-l-orange-400',
    bg: 'bg-orange-50/30 dark:bg-orange-950/10',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  todo: {
    label: 'À faire',
    border: 'border-l-4 border-l-muted',
    bg: '',
    badge: 'bg-muted text-muted-foreground',
  },
};

interface TaskCardProps {
  task: PlanningTask;
  onClick?: () => void;
  teamMembers?: { id: string; name: string }[];
  currentUserMemberId?: string | null;
  onAssign?: (taskId: string, memberId: string | null) => void;
  onStatusChange?: (taskId: string, status: PlanningStatus) => void;
  onPostpone?: (taskId: string, newDate: string) => void;
}

function getDateStr(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export function TaskCard({ task, onClick, teamMembers, currentUserMemberId, onAssign, onStatusChange, onPostpone }: TaskCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const effectivePriority = task.manual_priority || task.computed_priority;
  const priority = priorityConfig[effectivePriority] || priorityConfig.todo;

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date < todayStr && task.status !== 'done';
  const overdueDays = isOverdue
    ? Math.floor((new Date(todayStr).getTime() - new Date(task.due_date).getTime()) / 86400000)
    : 0;

  const assignedMemberName = task.assigned_to && teamMembers
    ? teamMembers.find(m => m.id === task.assigned_to)?.name
    : task.team_member_name;

  const isUnassigned = !task.assigned_to;
  const canAssign = !!onAssign && !!teamMembers && task.status !== 'done';

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

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange?.(task.id, 'done');
  };

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange?.(task.id, 'in_progress');
  };

  const handlePostponeToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPostpone?.(task.id, todayStr);
  };

  const handlePostponeTomorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPostpone?.(task.id, getDateStr(1));
  };

  const isDone = task.status === 'done';

  return (
    <Card
      className={cn(
        "p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow",
        priority.border,
        priority.bg,
        isDone && "opacity-50 border-l-muted",
        isOverdue && "border-orange-400 dark:border-orange-600"
      )}
      onClick={onClick}
    >
      {/* Row 1: Title + category */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {task.is_recurring && (
            <RefreshCw className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <h4 className={cn(
            "font-semibold text-sm leading-tight",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {categoryLabels[task.category] || task.category}
        </span>
      </div>

      {/* Row 2: Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {isOverdue && (
          <Badge className="text-[10px] px-1.5 py-0 bg-red-500 text-white border-0 gap-1">
            <Clock className="h-2.5 w-2.5" />
            {overdueDays}j retard
          </Badge>
        )}
        {task.source_module === 'maintenance' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700 gap-1">
            <Wrench className="h-2.5 w-2.5" />
            Maintenance
          </Badge>
        )}
        {task.status === 'in_progress' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            En cours
          </Badge>
        )}
        {task.status === 'blocked' && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Bloqué
          </Badge>
        )}
      </div>

      {/* Row 3: Quick actions */}
      {!isDone && (
        <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
          {/* Complete */}
          {onStatusChange && (task.status === 'in_progress' || task.status === 'todo') && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:hover:bg-green-900/40 dark:text-green-400 dark:border-green-800"
              onClick={handleComplete}
            >
              <Check className="h-3 w-3" />
              Terminer
            </Button>
          )}

          {/* Start */}
          {onStatusChange && task.status === 'todo' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1"
              onClick={handleStart}
            >
              <Play className="h-3 w-3" />
              Commencer
            </Button>
          )}

          {/* Postpone (for overdue) */}
          {isOverdue && onPostpone && (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1" onClick={handlePostponeToday}>
                Auj.
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1" onClick={handlePostponeTomorrow}>
                <CalendarClock className="h-3 w-3" />
                Demain
              </Button>
            </>
          )}

          {/* Take unassigned */}
          {canAssign && isUnassigned && currentUserMemberId && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1 ml-auto"
              onClick={handleTake}
            >
              <Hand className="h-3 w-3" />
              Prendre
            </Button>
          )}
        </div>
      )}

      {/* Row 4: Assignment */}
      <div className="flex items-center" onClick={e => e.stopPropagation()}>
        {canAssign ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors",
                  isUnassigned
                    ? "text-muted-foreground hover:bg-muted/50"
                    : "text-foreground/70 hover:bg-primary/10"
                )}
              >
                <User className="h-3 w-3" />
                {isUnassigned ? 'Non assigné' : assignedMemberName || 'Assigné'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="start">
              <div className="space-y-0.5">
                <button
                  className={cn(
                    "w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors",
                    isUnassigned && "bg-muted font-medium"
                  )}
                  onClick={() => handleAssign(null)}
                >
                  Non assigné
                </button>
                {teamMembers!.map(member => (
                  <button
                    key={member.id}
                    className={cn(
                      "w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors",
                      task.assigned_to === member.id && "bg-primary/10 font-medium text-primary"
                    )}
                    onClick={() => handleAssign(member.id)}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          !isDone && (assignedMemberName || isUnassigned) && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <User className="h-3 w-3" />
              {isUnassigned ? 'Non assigné' : assignedMemberName}
            </span>
          )
        )}
      </div>
    </Card>
  );
}
