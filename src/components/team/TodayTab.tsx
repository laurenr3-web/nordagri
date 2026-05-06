import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFarmId } from '@/hooks/useFarmId';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { usePlannedShiftsDay, useActualShiftsForDay } from '@/hooks/planned-shifts';
import { todayLocal } from '@/lib/dateLocal';
import type { PlannedShift, TeamTodayCardVM } from '@/types/PlannedShift';
import { ShiftCard } from './ShiftCard';
import { AddPresenceSheet } from './AddPresenceSheet';
import { QuickAssignSheet } from './QuickAssignSheet';

export function TodayTab() {
  const today = todayLocal();
  const { farmId } = useFarmId();
  const { teamMembers } = useTeamMembers();
  const { data: shifts = [] } = usePlannedShiftsDay(farmId, today);
  const { tasks } = usePlanningTasks(farmId, today, today);

  const userIds = useMemo(
    () => teamMembers.map((m) => m.user_id).filter((u): u is string => !!u),
    [teamMembers]
  );
  const { data: actuals = [] } = useActualShiftsForDay(farmId, today, userIds);

  const [presenceOpen, setPresenceOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<PlannedShift | null>(null);
  const [defaultMember, setDefaultMember] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const todayTasks = useMemo(
    () => (tasks || []).filter((t: any) => t.due_date === today && t.status !== 'done'),
    [tasks, today]
  );

  const unassigned = useMemo(
    () => todayTasks.filter((t: any) => !t.assigned_to),
    [todayTasks]
  );

  const cards: TeamTodayCardVM[] = useMemo(() => {
    const byMemberShift = new Map<string, PlannedShift>();
    for (const s of shifts) byMemberShift.set(s.farm_member_id, s);

    const actualsByUser = new Map<string, typeof actuals>();
    for (const a of actuals) {
      const arr = actualsByUser.get(a.user_id) || [];
      arr.push(a);
      actualsByUser.set(a.user_id, arr);
    }
    const now = Date.now();
    const parsePlannedSeconds = (start: string | null, end: string | null): number | null => {
      if (!start || !end) return null;
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
      const diff = (eh * 3600 + em * 60) - (sh * 3600 + sm * 60);
      return diff > 0 ? diff : null;
    };

    return teamMembers
      .filter((m) => m.user_id)
      .map((m) => {
        const shift = byMemberShift.get(m.id);
        const userId = m.user_id || null;
        const myTasks = todayTasks.filter((t: any) => t.assigned_to === userId);
        const urgent = myTasks.filter((t: any) => {
          const p = t.manual_priority || t.computed_priority;
          return p === 'critical' || p === 'important';
        });
        const userActuals = userId ? (actualsByUser.get(userId) || []) : [];
        const sortedActuals = [...userActuals].sort((a, b) =>
          a.punch_in_at.localeCompare(b.punch_in_at)
        );
        const firstIn = sortedActuals[0]?.punch_in_at || null;
        const last = sortedActuals[sortedActuals.length - 1];
        const lastOut = last?.punch_out_at || null;
        const isActive = sortedActuals.some((s) => s.status === 'active');
        const actualSeconds = sortedActuals.reduce((acc, s) => {
          const inMs = new Date(s.punch_in_at).getTime();
          const outMs = s.punch_out_at ? new Date(s.punch_out_at).getTime() : now;
          return acc + Math.max(0, Math.floor((outMs - inMs) / 1000));
        }, 0);
        return {
          shiftId: shift?.id || null,
          farmMemberId: m.id,
          userId,
          displayName: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
          startTime: shift?.start_time || null,
          endTime: shift?.end_time || null,
          roleLabel: shift?.role || null,
          shiftStatus: shift?.status || null,
          assignedCount: myTasks.length,
          urgentCount: urgent.length,
          actualStartAt: firstIn,
          actualEndAt: lastOut,
          actualActive: isActive,
          actualSeconds: userActuals.length ? actualSeconds : 0,
          plannedSeconds: parsePlannedSeconds(shift?.start_time || null, shift?.end_time || null),
        };
      })
      .sort((a, b) => {
        // Members with shifts first
        if (!!a.shiftId !== !!b.shiftId) return a.shiftId ? -1 : 1;
        return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
      });
  }, [teamMembers, shifts, todayTasks, actuals]);

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => { setEditingShift(null); setDefaultMember(null); setPresenceOpen(true); }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Présence
        </Button>
        <Button variant="secondary" onClick={() => setAssignOpen(true)} className="w-full">
          <ListChecks className="h-4 w-4 mr-1" /> Assigner
        </Button>
      </div>

      <section className="grid gap-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          Équipe aujourd'hui
        </h2>
        {cards.length === 0 && (
          <Card className="p-4 text-sm text-muted-foreground text-center">
            Aucun membre d'équipe.
          </Card>
        )}
        <div className="grid gap-2">
          {cards.map((vm) => (
            <ShiftCard
              key={vm.farmMemberId}
              vm={vm}
              onEdit={() => {
                const existing = shifts.find((s) => s.id === vm.shiftId) || null;
                setEditingShift(existing);
                setDefaultMember(vm.farmMemberId);
                setPresenceOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-semibold">Tâches non assignées ({unassigned.length})</h2>
        {unassigned.length === 0 ? (
          <Card className="p-3 text-sm text-muted-foreground text-center">
            Toutes les tâches sont assignées.
          </Card>
        ) : (
          <div className="grid gap-1.5">
            {unassigned.slice(0, 5).map((t: any) => (
              <Card key={t.id} className="p-2.5 text-sm break-words">
                {t.title}
              </Card>
            ))}
            {unassigned.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setAssignOpen(true)}>
                Voir les {unassigned.length} tâches
              </Button>
            )}
          </div>
        )}
      </section>

      <AddPresenceSheet
        open={presenceOpen}
        onOpenChange={setPresenceOpen}
        defaultDate={today}
        shift={editingShift}
        defaultFarmMemberId={defaultMember}
      />
      <QuickAssignSheet
        open={assignOpen}
        onOpenChange={setAssignOpen}
        unassignedTasks={unassigned}
      />
    </div>
  );
}