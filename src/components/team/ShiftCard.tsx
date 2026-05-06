import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Timer } from 'lucide-react';
import type { TeamTodayCardVM } from '@/types/PlannedShift';

interface Props {
  vm: TeamTodayCardVM;
  onEdit?: () => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'> = {
  scheduled: 'secondary',
  confirmed: 'success',
  absent: 'destructive',
  completed: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Planifié',
  confirmed: 'Confirmé',
  absent: 'Absent',
  completed: 'Terminé',
};

function formatTime(t: string | null) {
  if (!t) return null;
  return t.slice(0, 5);
}

function formatHM(seconds: number): string {
  if (!seconds || seconds < 0) return '0h00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${String(m).padStart(2, '0')}`;
}

function formatTimeFromIso(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatGap(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '−';
  const abs = Math.abs(seconds);
  return `${sign}${formatHM(abs)}`;
}

export function ShiftCard({ vm, onEdit }: Props) {
  const start = formatTime(vm.startTime);
  const end = formatTime(vm.endTime);
  const range = start && end ? `${start} – ${end}` : start ? `dès ${start}` : 'Horaire libre';

  const actualIn = formatTimeFromIso(vm.actualStartAt || null);
  const actualOut = formatTimeFromIso(vm.actualEndAt || null);
  const actualSeconds = vm.actualSeconds ?? 0;
  const hasActual = !!vm.actualStartAt;
  const actualRange = hasActual
    ? vm.actualActive
      ? `${actualIn} → en cours`
      : actualOut
        ? `${actualIn} – ${actualOut}`
        : `${actualIn}`
    : null;

  const gapSeconds =
    vm.plannedSeconds && hasActual ? actualSeconds - vm.plannedSeconds : null;
  const gapTone =
    gapSeconds == null
      ? null
      : Math.abs(gapSeconds) <= 15 * 60
        ? 'success'
        : gapSeconds < 0
          ? 'warning'
          : 'info';

  return (
    <Card className="p-3 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{vm.displayName}</div>
          <div className="text-xs text-muted-foreground truncate">{range}</div>
          {vm.roleLabel && (
            <div className="text-xs text-muted-foreground truncate">{vm.roleLabel}</div>
          )}
          {(hasActual || actualSeconds > 0) && (
            <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <Timer className="h-3 w-3 shrink-0" />
              <span className="truncate">
                Réel : {actualRange || '—'} · {formatHM(actualSeconds)}
              </span>
            </div>
          )}
        </div>
        {onEdit && (
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onEdit} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {vm.shiftStatus && (
          <Badge variant={STATUS_VARIANT[vm.shiftStatus] || 'secondary'} className="text-[10px]">
            {STATUS_LABEL[vm.shiftStatus] || vm.shiftStatus}
          </Badge>
        )}
        {vm.actualActive && (
          <Badge variant="success" className="text-[10px]">En poste</Badge>
        )}
        {gapSeconds != null && (
          <Badge variant={(gapTone || 'outline') as any} className="text-[10px]">
            Écart {formatGap(gapSeconds)}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px]">
          {vm.assignedCount} tâche{vm.assignedCount > 1 ? 's' : ''}
        </Badge>
        {vm.urgentCount > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {vm.urgentCount} urgent{vm.urgentCount > 1 ? 'es' : 'e'}
          </Badge>
        )}
      </div>
    </Card>
  );
}