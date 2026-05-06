import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertOctagon, Clock, ListChecks, Hourglass, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { planningService, type PlanningTask, type PlanningStatus } from '@/services/planning/planningService';
import { useFarmId } from '@/hooks/useFarmId';
import { todayLocal, localDateStr } from '@/lib/dateLocal';
import type { PlannedShift, PlannedShiftStatus } from '@/types/PlannedShift';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmMemberId: string | null;
  userId: string | null;
  displayName: string;
  roleLabel?: string | null;
  shift?: PlannedShift | null;
  todayTasks: PlanningTask[];
  unassignedTasks: PlanningTask[];
}

const STATUS_LABEL: Record<PlannedShiftStatus, string> = {
  scheduled: 'Planifié',
  confirmed: 'Confirmé',
  absent: 'Absent',
  completed: 'Terminé',
};
const STATUS_VARIANT: Record<PlannedShiftStatus, any> = {
  scheduled: 'secondary',
  confirmed: 'success',
  absent: 'destructive',
  completed: 'info',
};

const TASK_STATUS_LABEL: Record<PlanningStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  paused: 'En pause',
  done: 'Terminée',
  blocked: 'Bloquée',
};
const TASK_STATUS_VARIANT: Record<PlanningStatus, any> = {
  todo: 'secondary',
  in_progress: 'info',
  paused: 'outline',
  done: 'success',
  blocked: 'destructive',
};

function fmtTime(t: string | null | undefined) {
  return t ? t.slice(0, 5) : null;
}
function fmtIsoTime(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function fmtHM(seconds: number) {
  if (!seconds || seconds < 0) return '0h00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${String(m).padStart(2, '0')}`;
}

interface TimeSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string | null;
  start_time: string;
  end_time: string | null;
  status: string | null;
}

export function EmployeeDetailSheet({
  open,
  onOpenChange,
  farmMemberId,
  userId,
  displayName,
  roleLabel,
  shift,
  todayTasks,
  unassignedTasks,
}: Props) {
  const today = todayLocal();
  const { farmId } = useFarmId();
  const qc = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Today's time_sessions for this user (read-only).
  const { data: todaySessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['employee-detail', 'sessions-today', farmId, userId, today],
    enabled: open && !!farmId && !!userId,
    queryFn: async () => {
      const start = new Date(today + 'T00:00:00');
      const end = new Date(today + 'T00:00:00');
      end.setDate(end.getDate() + 1);
      const { data, error } = await supabase
        .from('time_sessions')
        .select('id,user_id,task_id,title,start_time,end_time,status')
        .eq('user_id', userId!)
        .gte('start_time', start.toISOString())
        .lt('start_time', end.toISOString())
        .order('start_time', { ascending: true });
      if (error) throw error;
      return (data || []) as TimeSessionRow[];
    },
  });

  // Recent history: last 7 days completed planning tasks for this user.
  const { data: recentDoneTasks = [], isLoading: recentLoading } = useQuery({
    queryKey: ['employee-detail', 'recent-done', farmId, userId, today],
    enabled: open && !!farmId && !!userId,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const sinceStr = localDateStr(since);
      const { data, error } = await supabase
        .from('planning_tasks')
        .select('id,title,due_date,status,assigned_to,updated_at,completed_at')
        .eq('farm_id', farmId!)
        .eq('assigned_to', userId!)
        .eq('status', 'done')
        .gte('due_date', sinceStr)
        .order('due_date', { ascending: false })
        .limit(7);
      if (error) throw error;
      return (data || []) as Array<{ id: string; title: string; due_date: string; status: string }>;
    },
  });

  // Recent worked seconds (last 7 days, completed sessions only).
  const { data: recentSeconds = 0 } = useQuery({
    queryKey: ['employee-detail', 'recent-seconds', userId, today],
    enabled: open && !!userId,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const { data, error } = await supabase
        .from('time_sessions')
        .select('start_time,end_time')
        .eq('user_id', userId!)
        .gte('start_time', since.toISOString())
        .not('end_time', 'is', null);
      if (error) throw error;
      return (data || []).reduce((acc: number, s: any) => {
        const inMs = new Date(s.start_time).getTime();
        const outMs = new Date(s.end_time).getTime();
        return acc + Math.max(0, Math.floor((outMs - inMs) / 1000));
      }, 0);
    },
  });

  // Reset pending id when sheet opens for a new employee
  useEffect(() => {
    if (open) setPendingId(null);
  }, [open, farmMemberId]);

  const myTasks = useMemo(
    () => todayTasks.filter((t) => t.assigned_to === userId),
    [todayTasks, userId]
  );
  const doneToday = myTasks.filter((t) => t.status === 'done').length;

  const plannedSeconds = useMemo(() => {
    const s = fmtTime(shift?.start_time);
    const e = fmtTime(shift?.end_time);
    if (!s || !e) return null;
    const [sh, sm] = s.split(':').map(Number);
    const [eh, em] = e.split(':').map(Number);
    const diff = (eh * 3600 + em * 60) - (sh * 3600 + sm * 60);
    return diff > 0 ? diff : null;
  }, [shift]);

  const actualSecondsToday = useMemo(() => {
    const now = Date.now();
    return todaySessions.reduce((acc, s) => {
      const inMs = new Date(s.start_time).getTime();
      const outMs = s.end_time ? new Date(s.end_time).getTime() : now;
      return acc + Math.max(0, Math.floor((outMs - inMs) / 1000));
    }, 0);
  }, [todaySessions]);

  const urgentCount = myTasks.filter((t) => {
    const p = t.manual_priority || t.computed_priority;
    return p === 'critical' || p === 'important';
  }).length;

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['planningTasks'] });
    qc.invalidateQueries({ queryKey: ['planningOverdue'] });
    qc.invalidateQueries({ queryKey: ['planningRecurring'] });
    qc.invalidateQueries({ queryKey: ['planningCompletions'] });
    qc.invalidateQueries({ queryKey: ['dashboard-v2'] });
    qc.invalidateQueries({ queryKey: ['employee-detail'] });
    if (farmId) qc.invalidateQueries({ queryKey: ['planned-shifts', farmId] });
  };

  const handleStatus = async (task: PlanningTask, status: PlanningStatus) => {
    setPendingId(task.id);
    try {
      await planningService.updateTaskStatus(task.id, status);
      invalidateAll();
      toast.success(status === 'done' ? 'Tâche terminée' : 'Tâche mise à jour');
    } catch (e: any) {
      toast.error(e?.message || 'Échec');
    } finally {
      setPendingId(null);
    }
  };

  const handleAssignToMe = async (task: PlanningTask) => {
    if (!userId) {
      toast.error('Aucun compte utilisateur lié à ce membre');
      return;
    }
    setPendingId(task.id);
    try {
      await planningService.updateTask(task.id, { assigned_to: userId });
      invalidateAll();
      toast.success('Tâche assignée');
    } catch (e: any) {
      toast.error(e?.message || 'Échec');
    } finally {
      setPendingId(null);
    }
  };

  // Build a simple chronological day timeline.
  type TimelineItem = {
    key: string;
    time: string; // HH:MM or '—'
    sortKey: number; // minutes since midnight, 1440 for unknown
    label: string;
    tone: 'shift' | 'session' | 'task-done' | 'task-progress' | 'task-blocked' | 'task-todo';
    sub?: string;
  };

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];
    const toMin = (hhmm: string | null) => {
      if (!hhmm) return 1440;
      const [h, m] = hhmm.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return 1440;
      return h * 60 + m;
    };
    if (shift && (shift.start_time || shift.end_time)) {
      const s = fmtTime(shift.start_time);
      const e = fmtTime(shift.end_time);
      items.push({
        key: `shift-${shift.id}`,
        time: s || '—',
        sortKey: toMin(s),
        label: 'Présence planifiée',
        tone: 'shift',
        sub: s && e ? `${s} – ${e}` : s || e || '',
      });
    }
    for (const s of todaySessions) {
      const t = fmtIsoTime(s.start_time);
      const end = fmtIsoTime(s.end_time);
      items.push({
        key: `session-${s.id}`,
        time: t || '—',
        sortKey: toMin(t),
        label: s.title || (s.task_id ? 'Tâche' : 'Pointage'),
        tone: 'session',
        sub: end ? `${t} – ${end}` : `${t} → en cours`,
      });
    }
    for (const t of myTasks) {
      const tone: TimelineItem['tone'] =
        t.status === 'done'
          ? 'task-done'
          : t.status === 'in_progress'
            ? 'task-progress'
            : t.status === 'blocked'
              ? 'task-blocked'
              : 'task-todo';
      items.push({
        key: `task-${t.id}`,
        time: '—',
        sortKey: 1440,
        label: t.title,
        tone,
        sub: TASK_STATUS_LABEL[t.status],
      });
    }
    return items.sort((a, b) => a.sortKey - b.sortKey);
  }, [shift, todaySessions, myTasks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{displayName}</SheetTitle>
        </SheetHeader>

        <div className="grid gap-3 py-3">
          {/* Header: status, role, schedule, badges */}
          <Card className="p-3 grid gap-2 overflow-hidden">
            {roleLabel && (
              <div className="text-xs text-muted-foreground truncate">{roleLabel}</div>
            )}
            <div className="text-sm">
              {shift?.start_time || shift?.end_time
                ? `${fmtTime(shift?.start_time) || '—'}${shift?.end_time ? ` – ${fmtTime(shift?.end_time)}` : ''}`
                : 'Horaire libre'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {shift?.status && (
                <Badge variant={STATUS_VARIANT[shift.status]} className="text-[10px]">
                  {STATUS_LABEL[shift.status]}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {myTasks.length} tâche{myTasks.length > 1 ? 's' : ''}
              </Badge>
              {urgentCount > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {urgentCount} urgent{urgentCount > 1 ? 'es' : 'e'}
                </Badge>
              )}
            </div>
          </Card>

          {/* Day summary */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-2.5 grid gap-0.5">
              <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Planifié
              </div>
              <div className="text-sm font-semibold">
                {plannedSeconds != null ? fmtHM(plannedSeconds) : '—'}
              </div>
            </Card>
            <Card className="p-2.5 grid gap-0.5">
              <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                <Hourglass className="h-3 w-3" /> Fait
              </div>
              <div className="text-sm font-semibold">
                {sessionsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : fmtHM(actualSecondsToday)}
              </div>
            </Card>
            <Card className="p-2.5 grid gap-0.5">
              <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Terminées
              </div>
              <div className="text-sm font-semibold">{doneToday}</div>
            </Card>
          </div>

          {/* Timeline */}
          <section className="grid gap-1.5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" /> Agenda du jour
            </h3>
            {timeline.length === 0 ? (
              <Card className="p-3 text-xs text-muted-foreground text-center">
                Rien de planifié aujourd'hui.
              </Card>
            ) : (
              <ol className="grid gap-1.5">
                {timeline.map((it) => (
                  <li
                    key={it.key}
                    className="flex items-start gap-2 rounded-md border bg-card px-2.5 py-2 min-w-0"
                  >
                    <div className="text-[11px] tabular-nums text-muted-foreground w-10 shrink-0 pt-0.5">
                      {it.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{it.label}</div>
                      {it.sub && (
                        <div className="text-[11px] text-muted-foreground truncate">{it.sub}</div>
                      )}
                    </div>
                    {it.tone === 'task-done' && (
                      <Badge variant="success" className="text-[10px] shrink-0">Terminée</Badge>
                    )}
                    {it.tone === 'task-progress' && (
                      <Badge variant="info" className="text-[10px] shrink-0">En cours</Badge>
                    )}
                    {it.tone === 'task-blocked' && (
                      <Badge variant="destructive" className="text-[10px] shrink-0">Bloquée</Badge>
                    )}
                    {it.tone === 'session' && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">Pointage</Badge>
                    )}
                    {it.tone === 'shift' && (
                      <Badge variant="outline" className="text-[10px] shrink-0">Horaire</Badge>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <Separator />

          {/* Assigned tasks */}
          <section className="grid gap-1.5">
            <h3 className="text-sm font-semibold">Tâches assignées ({myTasks.length})</h3>
            {myTasks.length === 0 ? (
              <Card className="p-3 text-xs text-muted-foreground text-center">
                Aucune tâche assignée à ce membre aujourd'hui.
              </Card>
            ) : (
              <div className="grid gap-1.5">
                {myTasks.map((t) => {
                  const priority = t.manual_priority || t.computed_priority;
                  const isPending = pendingId === t.id;
                  return (
                    <Card key={t.id} className="p-2.5 grid gap-2 overflow-hidden">
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium break-words">{t.title}</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant={TASK_STATUS_VARIANT[t.status]} className="text-[10px]">
                              {TASK_STATUS_LABEL[t.status]}
                            </Badge>
                            <Badge
                              variant={priority === 'critical' ? 'destructive' : priority === 'important' ? 'warning' : 'secondary'}
                              className="text-[10px]"
                            >
                              {priority === 'critical' ? 'Critique' : priority === 'important' ? 'Important' : 'À faire'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                          </div>
                        </div>
                      </div>
                      {t.status !== 'done' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            disabled={isPending}
                            onClick={() => handleStatus(t, 'done')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Terminer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending || t.status === 'blocked'}
                            onClick={() => handleStatus(t, 'blocked')}
                          >
                            <AlertOctagon className="h-4 w-4 mr-1" /> Bloquer
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Unassigned tasks → assign to this employee */}
          <section className="grid gap-1.5">
            <h3 className="text-sm font-semibold">Tâches à assigner ({unassignedTasks.length})</h3>
            {unassignedTasks.length === 0 ? (
              <Card className="p-3 text-xs text-muted-foreground text-center">
                Aucune tâche libre aujourd'hui.
              </Card>
            ) : (
              <div className="grid gap-1.5">
                {unassignedTasks.slice(0, 8).map((t) => {
                  const priority = t.manual_priority || t.computed_priority;
                  const isPending = pendingId === t.id;
                  return (
                    <Card key={t.id} className="p-2.5 grid gap-2 overflow-hidden">
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium break-words">{t.title}</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge
                              variant={priority === 'critical' ? 'destructive' : priority === 'important' ? 'warning' : 'secondary'}
                              className="text-[10px]"
                            >
                              {priority === 'critical' ? 'Critique' : priority === 'important' ? 'Important' : 'À faire'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending || !userId}
                        onClick={() => handleAssignToMe(t)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" /> Assigner à {displayName.split(' ')[0] || 'ce membre'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <Separator />

          {/* Recent history */}
          <section className="grid gap-1.5">
            <h3 className="text-sm font-semibold">Derniers jours</h3>
            <div className="text-[11px] text-muted-foreground">
              Heures travaillées (7 derniers jours) : {fmtHM(recentSeconds)}
            </div>
            {recentLoading ? (
              <Card className="p-3 text-xs text-muted-foreground text-center">
                <Loader2 className="h-4 w-4 animate-spin inline" />
              </Card>
            ) : recentDoneTasks.length === 0 ? (
              <Card className="p-3 text-xs text-muted-foreground text-center">
                Aucune tâche complétée récemment.
              </Card>
            ) : (
              <ul className="grid gap-1">
                {recentDoneTasks.slice(0, 7).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-card px-2.5 py-1.5 min-w-0"
                  >
                    <span className="text-sm truncate">{t.title}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {t.due_date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
