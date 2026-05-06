import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useFarmId } from '@/hooks/useFarmId';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { usePlannedShiftsWeek } from '@/hooks/planned-shifts';
import { localDateStr } from '@/lib/dateLocal';
import { AddPresenceSheet } from './AddPresenceSheet';
import type { PlannedShift } from '@/types/PlannedShift';
import { Badge } from '@/components/ui/badge';

function startOfWeek(d: Date): string {
  const day = d.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day); // Monday-based
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  return localDateStr(start);
}

function addDays(s: string, n: number): string {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function WeekTab() {
  const { farmId } = useFarmId();
  const { teamMembers } = useTeamMembers();
  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const { data: shifts = [] } = usePlannedShiftsWeek(farmId, weekStart);

  const [open, setOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState(weekStart);
  const [editing, setEditing] = useState<PlannedShift | null>(null);

  const memberName = (id: string) => {
    const m = teamMembers.find((t) => t.id === id);
    if (!m) return 'Membre';
    return `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid gap-2">
      {days.map((d, idx) => {
        const dShifts = shifts.filter((s) => s.shift_date === d);
        const dateObj = new Date(d + 'T00:00:00');
        return (
          <Card key={d} className="p-3">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {DAY_LABELS[idx]} {dateObj.getDate()}/{dateObj.getMonth() + 1}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {dShifts.length} présence{dShifts.length > 1 ? 's' : ''}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setEditing(null); setDefaultDate(d); setOpen(true); }}
              >
                <Plus className="h-4 w-4 mr-1" /> Présence
              </Button>
            </div>
            {dShifts.length === 0 ? (
              <div className="text-xs text-muted-foreground">—</div>
            ) : (
              <div className="grid gap-1.5">
                {dShifts.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setEditing(s); setDefaultDate(d); setOpen(true); }}
                    className="text-left flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 hover:bg-accent transition-colors min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{memberName(s.farm_member_id)}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {s.start_time?.slice(0, 5) || '—'}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                        {s.role ? ` · ${s.role}` : ''}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{s.status}</Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <AddPresenceSheet
        open={open}
        onOpenChange={setOpen}
        defaultDate={defaultDate}
        shift={editing}
      />
    </div>
  );
}