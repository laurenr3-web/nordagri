import React from 'react';
import { Play, Square, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useWorkShiftActions } from '@/hooks/work-shifts/useWorkShiftActions';
import { useLiveDuration, formatLiveDuration } from './useLiveDuration';
import { WorkShiftPunchOutGuard } from './WorkShiftPunchOutGuard';
import { WorkShiftReportDialog } from './WorkShiftReportDialog';

export function WorkShiftBar() {
  const a = useWorkShiftActions();
  const liveSeconds = useLiveDuration(a.activeShift?.punch_in_at ?? null);

  if (a.isLoading || !a.farmId || !a.userId) return null;

  return (
    <>
      <div className="rounded-lg border bg-card px-3 py-2.5 shadow-sm">
        {a.activeShift ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">Journée en cours</p>
                <p className="text-xs text-muted-foreground leading-tight truncate">
                  Début {format(new Date(a.activeShift.punch_in_at), 'HH:mm')} · {formatLiveDuration(liveSeconds)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => a.openReport(a.activeShift!.id)} aria-label="Voir journée">
                <FileText className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-9" onClick={() => void a.handlePunchOut()} disabled={a.isPunchingOut}>
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Punch out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">Journée de travail</p>
                <p className="text-xs text-muted-foreground leading-tight">Aucune journée commencée</p>
              </div>
            </div>
            <Button size="sm" className="h-9 shrink-0" onClick={() => void a.handlePunchIn()} disabled={a.isPunchingIn}>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Punch in
            </Button>
          </div>
        )}
      </div>

      <WorkShiftPunchOutGuard
        open={a.confirmOpen}
        taskTitle={a.pendingTaskTitle}
        onConfirm={() => void a.confirmPunchOutWithPause()}
        onCancel={a.cancelPunchOut}
      />
      <WorkShiftReportDialog shiftId={a.reportShiftId} open={a.reportOpen} onOpenChange={a.setReportOpen} />
    </>
  );
}