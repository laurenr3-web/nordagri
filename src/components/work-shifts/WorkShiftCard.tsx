import React from 'react';
import { Play, Square, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWorkShiftActions } from '@/hooks/work-shifts/useWorkShiftActions';
import { useLiveDuration, formatLiveDuration } from './useLiveDuration';
import { WorkShiftPunchOutGuard } from './WorkShiftPunchOutGuard';
import { WorkShiftReportDialog } from './WorkShiftReportDialog';

export function WorkShiftCard() {
  const a = useWorkShiftActions();
  const liveSeconds = useLiveDuration(a.activeShift?.punch_in_at ?? null);

  if (a.isLoading || !a.farmId || !a.userId) return null;

  return (
    <>
      <Card className="lg:max-w-md">
        <CardContent className="p-4">
          {a.activeShift ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">Journée en cours</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    Début {format(new Date(a.activeShift.punch_in_at), 'HH:mm')} · {formatLiveDuration(liveSeconds)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="h-11 flex-1" onClick={() => void a.handlePunchOut()} disabled={a.isPunchingOut}>
                  <Square className="mr-2 h-4 w-4" />
                  Punch out
                </Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={() => a.openReport(a.activeShift!.id)} aria-label="Voir journée">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">Journée de travail</p>
                  <p className="text-xs text-muted-foreground leading-tight">Aucune journée commencée</p>
                </div>
              </div>
              <Button className="h-11 w-full" onClick={() => void a.handlePunchIn()} disabled={a.isPunchingIn}>
                <Play className="mr-2 h-4 w-4" />
                Punch in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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