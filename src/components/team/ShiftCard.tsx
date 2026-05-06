import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
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

export function ShiftCard({ vm, onEdit }: Props) {
  const start = formatTime(vm.startTime);
  const end = formatTime(vm.endTime);
  const range = start && end ? `${start} – ${end}` : start ? `dès ${start}` : 'Horaire libre';

  return (
    <Card className="p-3 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{vm.displayName}</div>
          <div className="text-xs text-muted-foreground truncate">{range}</div>
          {vm.roleLabel && (
            <div className="text-xs text-muted-foreground truncate">{vm.roleLabel}</div>
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