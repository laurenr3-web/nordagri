
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Plus, AlertTriangle, User, ChevronRight, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanningTask } from '@/services/planning/planningService';

interface PlanningTodayData {
  critical: PlanningTask[];
  important: PlanningTask[];
  todo: PlanningTask[];
  maintenanceDueCount: number;
  teamMembers: Array<{ id: string; name: string }>;
}

interface PlanningTodayWidgetProps {
  data: PlanningTodayData | null;
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', dotClass: 'bg-destructive', textClass: 'text-destructive' },
  important: { label: 'Important', dotClass: 'bg-[hsl(var(--harvest-500,30_90%_50%))]', textClass: 'text-[hsl(var(--harvest-500,30_90%_50%))]' },
  todo: { label: 'À faire', dotClass: 'bg-muted-foreground', textClass: 'text-muted-foreground' },
} as const;

const TaskRow = ({ task, teamMembers }: { task: PlanningTask; teamMembers: Array<{ id: string; name: string }> }) => {
  const assigneeName = task.assigned_to
    ? teamMembers.find(m => m.id === task.assigned_to)?.name
    : null;

  return (
    <div className="flex items-center gap-3 py-1.5 min-w-0">
      <span className="text-sm text-foreground truncate flex-1">{task.title}</span>
      {assigneeName && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <User className="h-3 w-3" />
          {assigneeName}
        </span>
      )}
    </div>
  );
};

const PriorityGroup = ({ 
  priority, 
  tasks, 
  teamMembers 
}: { 
  priority: 'critical' | 'important' | 'todo'; 
  tasks: PlanningTask[];
  teamMembers: Array<{ id: string; name: string }>;
}) => {
  if (tasks.length === 0) return null;
  const config = PRIORITY_CONFIG[priority];
  const shown = tasks.slice(0, 2);
  const remaining = tasks.length - shown.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className={cn('w-2 h-2 rounded-full', config.dotClass)} />
        <span className={cn('text-xs font-semibold uppercase tracking-wide', config.textClass)}>
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground">({tasks.length})</span>
      </div>
      <div className="pl-4 border-l-2 border-border">
        {shown.map(task => (
          <TaskRow key={task.id} task={task} teamMembers={teamMembers} />
        ))}
        {remaining > 0 && (
          <span className="text-xs text-muted-foreground">+{remaining} autre{remaining > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};

export const PlanningTodayWidget = ({ data, loading, size }: PlanningTodayWidgetProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { critical, important, todo, maintenanceDueCount, teamMembers } = data;
  const totalTasks = critical.length + important.length + todo.length;
  const isEmpty = totalTasks === 0 && maintenanceDueCount === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Planification du jour</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate('/planning?addTask=true')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Ajouter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => navigate('/planning')}
          >
            Voir tout
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Tasks by priority */}
      {totalTasks > 0 ? (
        <div className="space-y-3">
          <PriorityGroup priority="critical" tasks={critical} teamMembers={teamMembers} />
          <PriorityGroup priority="important" tasks={important} teamMembers={teamMembers} />
          <PriorityGroup priority="todo" tasks={todo} teamMembers={teamMembers} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Aucune tâche aujourd'hui
        </p>
      )}

      {/* Maintenance due banner */}
      {maintenanceDueCount > 0 && (
        <button
          onClick={() => navigate('/planning')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors text-left"
        >
          <Wrench className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-sm font-medium text-destructive">
            {maintenanceDueCount} maintenance{maintenanceDueCount > 1 ? 's' : ''} due{maintenanceDueCount > 1 ? 's' : ''}
          </span>
          <ChevronRight className="h-4 w-4 text-destructive ml-auto" />
        </button>
      )}
    </div>
  );
};
