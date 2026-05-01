import React from 'react';
import { useTaskSessions } from '@/hooks/planning/usePlanningTaskTime';
import {
  formatSessionDate,
  formatSessionRange,
  formatDurationShort,
} from '@/services/planning/planningTimeFormat';

interface TaskSessionsListProps {
  taskId: string;
}

/**
 * Historique des sessions de temps liées à une tâche planifiée.
 * Une seule requête SQL avec join sur `profiles` (pas de N+1).
 */
export function TaskSessionsList({ taskId }: TaskSessionsListProps) {
  const { data: sessions, isLoading } = useTaskSessions(taskId);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Chargement…</p>;
  }
  if (!sessions || sessions.length === 0) {
    return <p className="text-xs text-muted-foreground">Aucune session pour le moment.</p>;
  }

  return (
    <div className="max-h-48 overflow-y-auto -mx-1 px-1 space-y-1.5">
      {sessions.map((s) => {
        const start = new Date(s.start_time).getTime();
        const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
        const seconds = Math.max(0, Math.floor((end - start) / 1000));
        return (
          <div
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card px-2 py-1.5 text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-foreground">
                <span className="font-medium">{formatSessionDate(s.start_time)}</span>
                <span className="text-muted-foreground">
                  {formatSessionRange(s.start_time, s.end_time)}
                </span>
              </div>
              {s.user_name && (
                <div className="truncate text-muted-foreground text-[11px]">{s.user_name}</div>
              )}
            </div>
            <span className="shrink-0 font-medium text-foreground">
              {formatDurationShort(seconds)}
            </span>
          </div>
        );
      })}
    </div>
  );
}