
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Plus, User, ChevronRight, Wrench } from 'lucide-react';
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

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-destructive',
  important: 'bg-[hsl(30_90%_50%)]',
  todo: 'bg-muted-foreground',
};

const TaskRow = ({
  task,
  teamMembers,
  isOverdue,
}: {
  task: PlanningTask;
  teamMembers: Array<{ id: string; name: string }>;
  isOverdue: boolean;
}) => {
  const navigate = useNavigate();
  const assigneeName = task.assigned_to
    ? teamMembers.find(m => m.id === task.assigned_to)?.name
    : null;
  const priority = task.manual_priority || task.computed_priority;

  return (
    <button
      onClick={() => navigate(`/planning?taskId=${task.id}`)}
      className="w-full flex items-center gap-2 py-1.5 min-w-0 text-left hover:bg-accent/50 rounded-md px-1.5 -mx-1.5 transition-colors"
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_DOT[priority] || PRIORITY_DOT.todo)} />
      <span className="text-sm text-foreground truncate flex-1">{task.title}</span>
      {isOverdue && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">
          En retard
        </span>
      )}
      {assigneeName && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <User className="h-3 w-3" />
          {assigneeName}
        </span>
      )}
    </button>
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
  const todayStr = new Date().toISOString().split('T')[0];
  const allActive = [...critical, ...important, ...todo];

  const priorityRank: Record<string, number> = { critical: 0, important: 1, todo: 2 };
  const sorted = [...allActive].sort((a, b) => {
    const aOverdue = a.due_date < todayStr ? 0 : a.due_date === todayStr ? 1 : 2;
    const bOverdue = b.due_date < todayStr ? 0 : b.due_date === todayStr ? 1 : 2;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const pa = a.manual_priority || a.computed_priority;
    const pb = b.manual_priority || b.computed_priority;
    const diff = (priorityRank[pa] ?? 2) - (priorityRank[pb] ?? 2);
    if (diff !== 0) return diff;
    return a.created_at.localeCompare(b.created_at);
  });

  const topTwo = sorted.slice(0, 2);
  const totalTasks = allActive.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Tâches du jour</h3>
          {totalTasks > 0 && (
            <span className="text-xs text-muted-foreground">
              ({totalTasks} active{totalTasks > 1 ? 's' : ''})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => navigate('/planning?addTask=true')}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Top urgent tasks */}
      {totalTasks > 0 ? (
        <div className="space-y-1">
          {topTwo.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              isOverdue={task.due_date < todayStr}
            />
          ))}
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

      {/* Voir toutes les tâches */}
      <Button
        variant="outline"
        size="sm"
        className="w-full h-9 text-xs"
        onClick={() => navigate('/planning')}
      >
        Voir toutes les tâches
        <ChevronRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
};
