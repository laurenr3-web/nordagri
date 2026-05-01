import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { workShiftService } from '@/services/work-shifts';
import type { ShiftReport } from '@/services/work-shifts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

interface Props {
  shiftId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkShiftReportDialog({ shiftId, open, onOpenChange }: Props) {
  const { data, isLoading } = useQuery<ShiftReport>({
    queryKey: ['work-shift-report', shiftId],
    queryFn: () => workShiftService.getShiftReport(shiftId as string),
    enabled: !!shiftId && open,
    staleTime: 15_000,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rapport de journée</DialogTitle>
          <DialogDescription>
            {data?.shift.punch_in_at
              ? format(new Date(data.shift.punch_in_at), "EEEE d MMMM yyyy", { locale: fr })
              : 'Détail de la journée'}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Row label="Punch in" value={format(new Date(data.shift.punch_in_at), 'HH:mm')} />
              <Row
                label="Punch out"
                value={data.shift.punch_out_at ? format(new Date(data.shift.punch_out_at), 'HH:mm') : 'En cours'}
              />
              <Row label="Temps total punché" value={formatDuration(data.punchedSeconds)} strong />
              <Row label="Temps sur tâches" value={formatDuration(data.taskSeconds)} />
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temps hors tâche</span>
                  <span className="text-sm font-semibold">{formatDuration(data.offTaskSeconds)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Temps punché sans session de tâche active.
                </p>
              </div>
            </div>

            {data.tasks.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Détail par tâche</h4>
                <ul className="space-y-1.5">
                  {data.tasks.map((t, i) => (
                    <li
                      key={`${t.task_id ?? 'none'}-${i}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-2">{t.title}</span>
                      <span className="shrink-0 text-muted-foreground">{formatDuration(t.seconds)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={strong ? 'text-sm font-semibold' : 'text-sm'}>{value}</span>
    </div>
  );
}
