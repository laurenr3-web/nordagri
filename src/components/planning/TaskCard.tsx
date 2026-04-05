
import React from 'react';
import { PlanningTask, PlanningStatus } from '@/services/planning/planningService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, CheckCircle2, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
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

interface TaskCardProps {
  task: PlanningTask;
  onStatusChange: (id: string, status: PlanningStatus) => void;
  onPostpone: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onStatusChange, onPostpone, onDelete }: TaskCardProps) {
  const effectivePriority = task.manual_priority || task.computed_priority;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className={cn(
            "font-semibold text-base leading-tight",
            task.status === 'done' && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-xs text-muted-foreground">{categoryLabels[task.category] || task.category}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusColors[task.status])}>
              {statusLabels[task.status]}
            </Badge>
          </div>
        </div>
      </div>

      {task.team_member_name && (
        <p className="text-xs text-muted-foreground">👤 {task.team_member_name}</p>
      )}

      {task.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
      )}

      {task.status !== 'done' && (
        <div className="flex flex-wrap gap-2">
          {task.status === 'todo' && (
            <Button size="sm" variant="default" className="h-9 text-xs gap-1.5 flex-1"
              onClick={() => onStatusChange(task.id, 'in_progress')}>
              <Play className="h-3.5 w-3.5" /> Commencer
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button size="sm" variant="default" className="h-9 text-xs gap-1.5 flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(task.id, 'done')}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Terminer
            </Button>
          )}
          {task.status !== 'blocked' && (
            <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5"
              onClick={() => onStatusChange(task.id, 'blocked')}>
              <AlertTriangle className="h-3.5 w-3.5" /> Bloqué
            </Button>
          )}
          {task.status === 'blocked' && (
            <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 flex-1"
              onClick={() => onStatusChange(task.id, 'todo')}>
              Débloquer
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-9 text-xs gap-1.5"
            onClick={() => onPostpone(task.id)}>
            <ArrowRight className="h-3.5 w-3.5" /> Reporter
          </Button>
        </div>
      )}

      {task.status === 'done' && (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="h-9 text-xs gap-1.5 text-destructive"
            onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3.5 w-3.5" /> Supprimer
          </Button>
        </div>
      )}
    </Card>
  );
}
