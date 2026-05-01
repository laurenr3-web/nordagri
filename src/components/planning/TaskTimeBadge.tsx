import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDurationShort } from '@/services/planning/planningTimeFormat';
import type { TaskTimeStats } from '@/services/planning/planningTimeService';

interface TaskTimeBadgeProps {
  stats: TaskTimeStats;
  className?: string;
  size?: 'sm' | 'md';
  /** Inline = no background, used inside the meta line. */
  inline?: boolean;
}

/**
 * Affiche le temps cumulé. Si une session est active, point vert pulsant + texte vert.
 * Sinon, icône Clock discrète. Variante `inline` (sans fond) pour fusion dans la meta-line.
 */
export function TaskTimeBadge({ stats, className, size = 'sm', inline = false }: TaskTimeBadgeProps) {
  if (stats.sessionCount === 0 && !stats.hasActive) return null;

  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const duration = formatDurationShort(stats.totalSeconds);

  if (stats.hasActive) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400',
          !inline && 'px-1.5 py-0.5 rounded-md',
          textSize,
          className,
        )}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-600" />
        </span>
        {duration}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        !inline && 'px-1.5 py-0.5 rounded-md bg-muted',
        textSize,
        className,
      )}
    >
      <Clock className="h-3 w-3" />
      {duration}
    </span>
  );
}
