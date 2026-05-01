import React from 'react';
import { Play, CheckCircle2, Unlock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PlanningTask } from '@/services/planning/planningService';
import {
  useTaskTimeStats,
  usePlanningTimeMutations,
} from '@/hooks/planning/usePlanningTaskTime';

interface TaskTimeControlsProps {
  task: PlanningTask;
  userId: string | null;
  variant?: 'card' | 'dialog';
  className?: string;
}

/**
 * Boutons d'action contextuels pour le suivi de temps d'une tâche.
 * Règle UX : 1 clic = 1 action. Mobile-first (h-9, gap minimal, flex-1).
 *
 * Edge case géré : task.status === 'in_progress' MAIS aucune session active
 *  → on affiche uniquement [Reprendre] (pas d'[Arrêter] qui n'aurait rien à arrêter).
 */
export function TaskTimeControls({ task, userId, variant = 'card', className }: TaskTimeControlsProps) {
  const { data: stats } = useTaskTimeStats(task.id);
  const { start, resume, pause, complete, unblock } = usePlanningTimeMutations();

  if (task.status === 'done') return null;
  if (!userId) return null;

  const hasActive = stats?.hasActive === true;
  const isLoadingMutation =
    start.isPending || resume.isPending || pause.isPending || complete.isPending || unblock.isPending;

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const btnSize = variant === 'card' ? 'h-9 text-xs' : 'h-10 text-sm';

  // ── blocked ────────────────────────────────────────────────
  if (task.status === 'blocked') {
    return (
      <div className={cn('flex gap-2', className)} onClick={stop}>
        <Button
          size="sm"
          variant="outline"
          className={cn('gap-1.5 px-3', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => unblock.mutate({ taskId: task.id })}
        >
          <Unlock className="h-3.5 w-3.5" />
          Débloquer
        </Button>
      </div>
    );
  }

  // ── todo ───────────────────────────────────────────────────
  if (task.status === 'todo') {
    return (
      <div className={cn('flex justify-end gap-2', className)} onClick={stop}>
        <Button
          size="sm"
          variant="outline"
          className={cn('gap-1.5 px-3', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => start.mutate({ task, userId })}
        >
          <Play className="h-3.5 w-3.5" />
          Démarrer
        </Button>
      </div>
    );
  }

  // ── paused ─────────────────────────────────────────────────
  if (task.status === 'paused') {
    return (
      <div className={cn('flex justify-end gap-2', className)} onClick={stop}>
        <Button
          size="sm"
          variant="outline"
          className={cn('gap-1.5 px-3', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => resume.mutate({ task, userId })}
        >
          <Play className="h-3.5 w-3.5" />
          Reprendre
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn('gap-1.5 px-3', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => complete.mutate({ taskId: task.id })}
        >
          <Flag className="h-3.5 w-3.5" />
          Terminer
        </Button>
      </div>
    );
  }

  // ── in_progress ────────────────────────────────────────────
  if (task.status === 'in_progress') {
    // Edge case : statut in_progress mais aucune session active → uniquement Reprendre
    if (!hasActive) {
      return (
        <div className={cn('flex justify-end gap-2', className)} onClick={stop}>
          <Button
            size="sm"
            variant="outline"
            className={cn('gap-1.5 px-3', btnSize)}
            disabled={isLoadingMutation}
            onClick={() => resume.mutate({ task, userId })}
          >
            <Play className="h-3.5 w-3.5" />
            Reprendre
          </Button>
        </div>
      );
    }

    // Cas normal : session active → Terminer session (pause) + Terminer tâche (outline)
    return (
      <div className={cn('flex gap-2', className)} onClick={stop}>
        <Button
          size="sm"
          className={cn('flex-1 gap-1.5', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => pause.mutate({ taskId: task.id })}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Terminer session
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn('flex-1 gap-1.5', btnSize)}
          disabled={isLoadingMutation}
          onClick={() => complete.mutate({ taskId: task.id })}
        >
          <Flag className="h-3.5 w-3.5" />
          Terminer tâche
        </Button>
      </div>
    );
  }

  return null;
}