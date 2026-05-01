import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDurationShort } from '@/services/planning/planningTimeFormat';
import type { TaskTimeStats } from '@/services/planning/planningTimeService';

interface TaskTimeBadgeProps {
  stats: TaskTimeStats;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Affiche le temps total cumulé sur la tâche + nb sessions, et un badge
 * "● En cours" pulsant si une session est actuellement active.
 * Re-render automatique toutes les ~10s via le polling React Query (useTaskTimeStats).
 */
export function TaskTimeBadge({ stats, className, size = 'sm' }: TaskTimeBadgeProps) {
  if (stats.sessionCount === 0 && !stats.hasActive) return null;

  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground',
          textSize,
        )}
      >
        <Clock className="h-3 w-3" />
        {formatDurationShort(stats.totalSeconds)}
        {stats.sessionCount > 0 && (
          <span className="opacity-70">
            · {stats.sessionCount} session{stats.sessionCount > 1 ? 's' : ''}
          </span>
        )}
      </span>
      {stats.hasActive && (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            textSize,
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-600" />
          </span>
          En cours
        </span>
      )}
    </div>
  );
}