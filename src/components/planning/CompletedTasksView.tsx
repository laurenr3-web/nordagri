import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertOctagon, Flame, ListChecks, Clock, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

type Period = 'today' | 'week' | 'month';

interface TeamMember { id: string; name: string; userId?: string; isOwner?: boolean }

interface CompletedItem {
  key: string;
  taskId: string;
  title: string;
  category: string;
  priority: 'critical' | 'important' | 'todo';
  completedAt: Date;
  completedByUserId: string | null;
  completedByName: string;
  isRecurringOccurrence: boolean;
  notes: string | null;
  assignedToName: string | null;
  equipmentId: number | null;
  dueDate: string;
  wasOverdue: boolean;
}

const categoryLabels: Record<string, string> = {
  animaux: '🐄 Animaux',
  champs: '🌾 Champs',
  alimentation: '🥩 Alimentation',
  equipement: '🚜 Équipement',
  batiment: '🏠 Bâtiment',
  administration: '📋 Administration',
  autre: '📌 Autre',
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
  important: { label: 'Important', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  todo: { label: 'À faire', className: 'bg-muted text-muted-foreground border-transparent' },
};

function getRangeFromPeriod(period: Period): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === 'week') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'month') {
    start.setDate(start.getDate() - 29);
  }
  return { start, end };
}

function formatRelative(d: Date): string {
  if (isToday(d)) return `Aujourd'hui ${format(d, 'HH:mm', { locale: fr })}`;
  if (isYesterday(d)) return `Hier ${format(d, 'HH:mm', { locale: fr })}`;
  return format(d, "d MMM 'à' HH:mm", { locale: fr });
}

interface CompletedTasksViewProps {
  farmId: string | null;
  teamMembers: TeamMember[];
  currentUserId: string | null;
}

export function CompletedTasksView({ farmId, teamMembers, currentUserId }: CompletedTasksViewProps) {
  const [period, setPeriod] = useState<Period>('today');
  const [employeeFilter, setEmployeeFilter] = useState<string | 'all' | 'me'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'important' | 'overdue'>('all');
  const [selected, setSelected] = useState<CompletedItem | null>(null);

  const { start, end } = useMemo(() => getRangeFromPeriod(period), [period]);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  // Fetch non-recurring done tasks within window
  const { data: doneTasks = [], isLoading: loadingDone } = useQuery({
    queryKey: ['completed-planning-tasks', farmId, startIso, endIso],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('planning_tasks')
        .select('*')
        .eq('farm_id', farmId)
        .eq('status', 'done')
        .not('completed_at', 'is', null)
        .gte('completed_at', startIso)
        .lte('completed_at', endIso)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  // Fetch recurring completions within window
  const { data: recurringCompletions = [], isLoading: loadingRec } = useQuery({
    queryKey: ['completed-planning-recurring', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data: tasks } = await supabase
        .from('planning_tasks')
        .select('id, title, category, manual_priority, computed_priority, notes, assigned_to, equipment_id, due_date, farm_id, is_recurring')
        .eq('farm_id', farmId)
        .eq('is_recurring', true);
      const taskIds = (tasks || []).map(t => t.id);
      if (taskIds.length === 0) return [];
      const { data: completions, error } = await supabase
        .from('planning_task_completions')
        .select('*')
        .in('task_id', taskIds)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate)
        .order('completion_date', { ascending: false });
      if (error) throw error;
      const map = new Map<string, any>();
      (tasks || []).forEach(t => map.set(t.id, t));
      return (completions || []).map(c => ({ completion: c, task: map.get(c.task_id) })).filter(x => x.task);
    },
    enabled: !!farmId,
  });

  // Fetch tasks ASSIGNED in the same period (open tasks per employee)
  const { data: assignedOpenTasks = [] } = useQuery({
    queryKey: ['assigned-open-planning-tasks', farmId, startDate, endDate],
    queryFn: async () => {
      if (!farmId) return [];
      const { data, error } = await supabase
        .from('planning_tasks')
        .select('id, assigned_to, status, due_date, manual_priority, computed_priority')
        .eq('farm_id', farmId)
        .not('assigned_to', 'is', null)
        .neq('status', 'done')
        .gte('due_date', startDate)
        .lte('due_date', endDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmId,
  });

  const memberByUserId = useMemo(() => {
    const m = new Map<string, TeamMember>();
    teamMembers.forEach(tm => { if (tm.userId) m.set(tm.userId, tm); });
    return m;
  }, [teamMembers]);

  const memberById = useMemo(() => {
    const m = new Map<string, TeamMember>();
    teamMembers.forEach(tm => m.set(tm.id, tm));
    return m;
  }, [teamMembers]);

  const items: CompletedItem[] = useMemo(() => {
    const result: CompletedItem[] = [];
    for (const t of doneTasks) {
      const completedAt = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at);
      const completer = t.completed_by ? memberByUserId.get(t.completed_by) : undefined;
      const assignedMember = t.assigned_to ? memberById.get(t.assigned_to) : undefined;
      const wasOverdue = t.due_date && new Date(t.due_date + 'T23:59:59') < completedAt;
      result.push({
        key: `t_${t.id}`,
        taskId: t.id,
        title: t.title,
        category: t.category,
        priority: ((t.manual_priority || t.computed_priority) || 'todo') as any,
        completedAt,
        completedByUserId: t.completed_by,
        completedByName: completer?.name || (t.completed_by ? 'Inconnu' : '—'),
        isRecurringOccurrence: false,
        notes: t.notes,
        assignedToName: assignedMember?.name || null,
        equipmentId: t.equipment_id,
        dueDate: t.due_date,
        wasOverdue: !!wasOverdue,
      });
    }
    for (const { completion, task } of recurringCompletions) {
      const completedAt = new Date(completion.created_at);
      const completer = memberByUserId.get(completion.completed_by);
      const assignedMember = task.assigned_to ? memberById.get(task.assigned_to) : undefined;
      const wasOverdue = new Date(completion.completion_date + 'T23:59:59') < completedAt;
      result.push({
        key: `r_${completion.task_id}_${completion.completion_date}`,
        taskId: task.id,
        title: task.title,
        category: task.category,
        priority: ((task.manual_priority || task.computed_priority) || 'todo') as any,
        completedAt,
        completedByUserId: completion.completed_by,
        completedByName: completer?.name || 'Inconnu',
        isRecurringOccurrence: true,
        notes: task.notes,
        assignedToName: assignedMember?.name || null,
        equipmentId: task.equipment_id,
        dueDate: completion.completion_date,
        wasOverdue: !!wasOverdue,
      });
    }
    result.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    return result;
  }, [doneTasks, recurringCompletions, memberByUserId, memberById]);

  // Apply employee filter
  const filtered = useMemo(() => {
    if (employeeFilter === 'all') return items;
    if (employeeFilter === 'me') return items.filter(i => i.completedByUserId === currentUserId);
    return items.filter(i => i.completedByUserId === employeeFilter);
  }, [items, employeeFilter, currentUserId]);

  // Stats
  const stats = useMemo(() => {
    let critical = 0, important = 0, overdue = 0;
    for (const i of filtered) {
      if (i.priority === 'critical') critical++;
      else if (i.priority === 'important') important++;
      if (i.wasOverdue) overdue++;
    }
    return { total: filtered.length, critical, important, overdue };
  }, [filtered]);

  // Per-employee stats
  // Per-employee stats — includes ALL team members, even with 0 done tasks
  const perEmployee = useMemo(() => {
    type Row = { key: string; name: string; isMe: boolean; total: number; critical: number; assigned: number };
    const map = new Map<string, Row>();

    // Seed with every team member so they all appear
    for (const tm of teamMembers) {
      const key = tm.userId || tm.id;
      map.set(key, {
        key,
        name: tm.name,
        isMe: !!tm.userId && tm.userId === currentUserId,
        total: 0,
        critical: 0,
        assigned: 0,
      });
    }

    // Count completed (filtered by period + employee filter for the cards above,
    // but the per-employee card should reflect the period regardless of employee filter)
    for (const i of items) {
      const key = i.completedByUserId || 'unknown';
      const cur = map.get(key) || {
        key,
        name: i.completedByName,
        isMe: i.completedByUserId === currentUserId,
        total: 0,
        critical: 0,
        assigned: 0,
      };
      cur.total++;
      if (i.priority === 'critical') cur.critical++;
      map.set(key, cur);
    }

    // Count assigned-but-not-done open tasks in the period (assigned_to is a farm_members.id)
    const memberIdToUserId = new Map<string, string | undefined>();
    teamMembers.forEach(tm => memberIdToUserId.set(tm.id, tm.userId));
    for (const t of assignedOpenTasks) {
      const userId = memberIdToUserId.get(t.assigned_to as string);
      const key = userId || (t.assigned_to as string);
      const cur = map.get(key);
      if (cur) {
        cur.assigned++;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      // Me first, then by total done desc, then by name
      if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    });
  }, [items, teamMembers, currentUserId, assignedOpenTasks]);

  // Group by day for the list
  const groupedByDay = useMemo(() => {
    const groups: { label: string; items: CompletedItem[] }[] = [];
    const map = new Map<string, CompletedItem[]>();
    const displayed = priorityFilter === 'all'
      ? filtered
      : priorityFilter === 'overdue'
        ? filtered.filter(i => i.wasOverdue)
        : filtered.filter(i => i.priority === priorityFilter);
    for (const i of displayed) {
      const k = i.completedAt.toISOString().split('T')[0];
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(i);
    }
    const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    for (const k of keys) {
      const d = new Date(k + 'T12:00:00');
      let label: string;
      if (isToday(d)) label = "Aujourd'hui";
      else if (isYesterday(d)) label = 'Hier';
      else label = format(d, 'EEEE d MMMM', { locale: fr });
      groups.push({ label: label.charAt(0).toUpperCase() + label.slice(1), items: map.get(k)! });
    }
    return groups;
  }, [filtered, priorityFilter]);

  const isLoading = loadingDone || loadingRec;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Tâches terminées</h2>
        <p className="text-sm text-muted-foreground">Voir ce qui a été fait et par qui.</p>
      </div>

      {/* Period chips */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { v: 'today', label: "Aujourd'hui" },
          { v: 'week', label: '7 jours' },
          { v: 'month', label: '30 jours' },
        ] as { v: Period; label: string }[]).map(p => (
          <Button
            key={p.v}
            type="button"
            variant={period === p.v ? 'default' : 'outline'}
            className="h-10 rounded-full text-sm"
            onClick={() => setPeriod(p.v)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Employee filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <Button
          variant={employeeFilter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="rounded-full shrink-0 h-8"
          onClick={() => setEmployeeFilter('all')}
        >
          Tous
        </Button>
        {currentUserId && (
          <Button
            variant={employeeFilter === 'me' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full shrink-0 h-8"
            onClick={() => setEmployeeFilter('me')}
          >
            Moi
          </Button>
        )}
        {teamMembers.filter(m => m.userId && m.userId !== currentUserId).map(m => (
          <Button
            key={m.id}
            variant={employeeFilter === m.userId ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full shrink-0 h-8"
            onClick={() => setEmployeeFilter(m.userId!)}
          >
            {m.name}
          </Button>
        ))}
      </div>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<ListChecks className="h-4 w-4" />}
          label="Terminées"
          value={stats.total}
          tone="default"
          active={priorityFilter === 'all'}
          onClick={() => setPriorityFilter('all')}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Critiques"
          value={stats.critical}
          tone="critical"
          active={priorityFilter === 'critical'}
          onClick={() => setPriorityFilter(p => p === 'critical' ? 'all' : 'critical')}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Importantes"
          value={stats.important}
          tone="important"
          active={priorityFilter === 'important'}
          onClick={() => setPriorityFilter(p => p === 'important' ? 'all' : 'important')}
        />
        <StatCard
          icon={<AlertOctagon className="h-4 w-4" />}
          label="En retard"
          value={stats.overdue}
          tone="overdue"
          active={priorityFilter === 'overdue'}
          onClick={() => setPriorityFilter(p => p === 'overdue' ? 'all' : 'overdue')}
        />
      </div>

      {/* Per-employee compact list */}
      {perEmployee.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Par employé</h3>
            <span className="text-[10px] text-muted-foreground">terminées · en cours</span>
          </div>
          <ul className="space-y-1.5">
            {perEmployee.map((e) => (
              <li
                key={e.key}
                className={cn(
                  'flex items-center justify-between text-sm rounded-md px-1.5 py-1 cursor-pointer transition-colors',
                  employeeFilter === (e.isMe ? 'me' : e.key)
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                )}
                onClick={() => setEmployeeFilter(e.isMe ? 'me' : e.key as any)}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {e.name}
                    {e.isMe && <span className="text-muted-foreground text-xs"> (moi)</span>}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={e.total > 0 ? 'secondary' : 'outline'}
                    className={cn(
                      'text-xs gap-1',
                      e.total === 0 && 'text-muted-foreground'
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {e.total}
                  </Badge>
                  {e.assigned > 0 && (
                    <Badge variant="outline" className="text-xs gap-1 border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-900/50">
                      <Clock className="h-3 w-3" />
                      {e.assigned}
                    </Badge>
                  )}
                  {e.critical > 0 && (
                    <Badge className={cn('text-xs', priorityConfig.critical.className)} variant="outline">
                      {e.critical} crit.
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* List grouped by day */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Chargement…</Card>
        ) : groupedByDay.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune tâche terminée sur cette période.</p>
          </Card>
        ) : (
          groupedByDay.map(group => (
            <div key={group.label} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelected(item)}
                    className="w-full text-left"
                  >
                    <Card className="p-3 hover:bg-accent/50 transition-colors active:scale-[0.99]">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{item.title}</p>
                            <Badge variant="outline" className={cn('text-[10px] shrink-0', priorityConfig[item.priority].className)}>
                              {priorityConfig[item.priority].label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                            <UserIcon className="h-3 w-3" />
                            <span className="font-medium text-foreground/80">{item.completedByName}</span>
                            <span>·</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatRelative(item.completedAt)}</span>
                            {item.wasOverdue && (
                              <Badge className="text-[9px] h-4 px-1.5 bg-orange-500 text-white border-0">retard</Badge>
                            )}
                          </div>
                          {item.assignedToName && item.assignedToName !== item.completedByName && (
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 gap-1"
                              >
                                <UserIcon className="h-2.5 w-2.5" />
                                Assigné à {item.assignedToName}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg leading-tight pr-6">{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {categoryLabels[selected.category] || selected.category}
                  </span>
                  <Badge variant="outline" className={cn('text-xs', priorityConfig[selected.priority].className)}>
                    {priorityConfig[selected.priority].label}
                  </Badge>
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Terminée
                  </Badge>
                  {selected.isRecurringOccurrence && (
                    <Badge variant="outline" className="text-xs">↻ récurrente</Badge>
                  )}
                </div>

                {selected.notes && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selected.notes}</p>
                )}

                <Separator />

                <dl className="space-y-2 text-sm">
                  <Row label="Complétée par" value={selected.completedByName} />
                  <Row label="Date de complétion" value={format(selected.completedAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })} />
                  <Row label="Échéance" value={format(new Date(selected.dueDate + 'T12:00:00'), 'd MMMM yyyy', { locale: fr })} />
                  {selected.assignedToName && <Row label="Assignée à" value={selected.assignedToName} />}
                  {selected.wasOverdue && <Row label="Statut" value="Terminée en retard" />}
                </dl>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground text-xs uppercase tracking-wide pt-0.5">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'default' | 'critical' | 'important' | 'overdue';
}
function StatCard({ icon, label, value, tone }: StatCardProps) {
  const toneClass: Record<StatCardProps['tone'], string> = {
    default: 'bg-card',
    critical: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50',
    important: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/50',
    overdue: 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50',
  };
  const iconClass: Record<StatCardProps['tone'], string> = {
    default: 'text-muted-foreground',
    critical: 'text-red-600 dark:text-red-400',
    important: 'text-yellow-600 dark:text-yellow-400',
    overdue: 'text-orange-600 dark:text-orange-400',
  };
  return (
    <Card className={cn('p-3 flex flex-col gap-1', toneClass[tone])}>
      <div className={cn('flex items-center gap-1.5 text-xs font-medium', iconClass[tone])}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold leading-none">{value}</div>
    </Card>
  );
}