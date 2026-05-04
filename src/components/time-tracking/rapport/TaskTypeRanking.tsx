import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { normalizeAndGroupTaskTypes } from './utils/taskTypeUtils';
import { cn } from '@/lib/utils';

interface Props {
  data: TaskTypeDistribution[];
  isLoading: boolean;
}

const formatDuration = (hours: number): string => {
  const minutes = hours * 60;
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h} h` : `${h} h ${m}`;
};

const formatPercent = (pct: number): string => {
  if (pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
};

const getCategoryColor = (type: string): { dot: string; soft: string } => {
  const t = type.toLowerCase();
  if (t.includes('animau') || t.includes('traite') || t.includes('milk') || t.includes('étable') || t.includes('etable'))
    return { dot: 'bg-emerald-500', soft: 'bg-emerald-500/10' };
  if (t.includes('équipement') || t.includes('equipement') || t.includes('opération') || t.includes('operation'))
    return { dot: 'bg-orange-500', soft: 'bg-orange-500/10' };
  if (t.includes('maintenance') || t.includes('entretien') || t.includes('réparation') || t.includes('reparation') || t.includes('repair'))
    return { dot: 'bg-violet-500', soft: 'bg-violet-500/10' };
  if (t.includes('bâtiment') || t.includes('batiment') || t.includes('building'))
    return { dot: 'bg-rose-500', soft: 'bg-rose-500/10' };
  if (t.includes('alimentation') || t.includes('feed'))
    return { dot: 'bg-amber-500', soft: 'bg-amber-500/10' };
  return { dot: 'bg-slate-400', soft: 'bg-slate-400/10' };
};

export const TaskTypeRanking: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const grouped = normalizeAndGroupTaskTypes(data || []).filter(t => t.hours > 0);
  const totalHours = grouped.reduce((s, t) => s + t.hours, 0);

  if (!grouped.length || totalHours === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-foreground">Aucun temps enregistré</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Les données apparaîtront lorsque des sessions seront terminées.
        </p>
      </div>
    );
  }

  const principal = grouped[0];

  return (
    <div className="space-y-4">
      {/* Compact summary */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">{formatDuration(totalHours)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Principal</p>
          <p className="mt-0.5 truncate text-sm font-semibold">{principal.type}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Types actifs</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{grouped.length}</p>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>Type de travail</span>
        <span className="text-right w-20">Temps</span>
        <span className="text-right w-16">Part</span>
      </div>

      {/* Rows */}
      <ul className="space-y-2">
        {grouped.map((task, idx) => {
          const pct = (task.hours / totalHours) * 100;
          const colors = getCategoryColor(task.type);
          const isPrincipal = idx === 0;
          return (
            <li
              key={task.type}
              className={cn(
                'group rounded-xl border border-border/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3',
                'transition-colors hover:bg-muted/40'
              )}
            >
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', colors.dot)} />
                  <span className="truncate text-sm font-medium">{task.type}</span>
                  {isPrincipal && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                      Principal
                    </Badge>
                  )}
                </div>
                <span className="w-20 text-right text-sm font-semibold tabular-nums">
                  {formatDuration(task.hours)}
                </span>
                <span className="w-16 text-right text-sm tabular-nums text-muted-foreground">
                  {formatPercent(pct)}
                </span>
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', colors.dot)} />
                    <span className="truncate text-sm font-medium">{task.type}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums shrink-0">
                    {formatDuration(task.hours)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-4.5">
                  {isPrincipal && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                      Principal
                    </Badge>
                  )}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatPercent(pct)} du total
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TaskTypeRanking;
