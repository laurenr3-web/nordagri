
import React from 'react';
import { PlanningTask } from '@/services/planning/planningService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
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

const statusLabels: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  blocked: 'Bloqué',
};

const statusColors: Record<string, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
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
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const effectivePriority = task.manual_priority || task.computed_priority;
  const priority = priorityConfig[effectivePriority] || priorityConfig.todo;

  return (
    <Card
      className={cn("p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow", task.status === 'done' && "opacity-60")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className={cn(
          "font-semibold text-sm leading-tight flex-1",
          task.status === 'done' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h4>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", priority.className)}>
          {priority.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{categoryLabels[task.category] || task.category}</span>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusColors[task.status])}>
          {statusLabels[task.status]}
        </Badge>
      </div>

      {task.team_member_name && (
        <p className="text-xs text-muted-foreground">👤 {task.team_member_name}</p>
      )}

      {task.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
      )}
    </Card>
  );
}
