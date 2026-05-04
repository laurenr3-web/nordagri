import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, ListChecks, Users, Activity, Wrench } from 'lucide-react';
import { useFarmId } from '@/hooks/useFarmId';
import { useTaskHoursLast7Days, type TaskHoursRange } from '@/hooks/time-tracking/useTaskHoursLast7Days';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatHours(h: number) {
  if (!h || h <= 0) return '0 min';
  const totalMinutes = Math.round(h * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  if (hh === 0) return `${mm} min`;
  if (mm === 0) return `${hh} h`;
  return `${hh} h ${mm.toString().padStart(2, '0')}`;
}

const RANGE_LABELS: Record<TaskHoursRange, { short: string; long: string }> = {
  today: { short: "Aujourd'hui", long: "Aujourd'hui" },
  '7d': { short: '7 j', long: '7 derniers jours' },
  '30d': { short: '30 j', long: '30 derniers jours' },
  all: { short: 'Tout', long: "Tout l'historique" },
};

const TaskHoursTab: React.FC = () => {
  const { farmId } = useFarmId();
  const [range, setRange] = useState<TaskHoursRange>('7d');
  const { data, isLoading } = useTaskHoursLast7Days(farmId, range);
  const [userFilter, setUserFilter] = useState<string>('all');

  const userOptions = useMemo(() => {
    if (!data) return [] as { id: string; name: string }[];
    const present = new Set<string>();
    data.sessions.forEach(s => present.add(s.user_id));
    return Array.from(present)
      .map(id => ({ id, name: data.userNames[id] || 'Utilisateur' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const filteredSessions = useMemo(() => {
    if (!data) return [];
    return userFilter === 'all' ? data.sessions : data.sessions.filter(s => s.user_id === userFilter);
  }, [data, userFilter]);

  const grouped = useMemo(() => {
    if (!data) return [];
    const sessions = filteredSessions;
    const map = new Map<string, {
      key: string;
      label: string;
      taskStatus?: string | null;
      equipmentName?: string | null;
      totalHours: number;
      sessions: number;
      perUser: Map<string, { name: string; hours: number; sessions: number }>;
      lastStart: string;
    }>();

    for (const s of sessions) {
      const dur = (() => {
        if (s.duration && s.duration > 0) return Number(s.duration);
        if (s.end_time) {
          return Math.max(0, (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000);
        }
        // active session — count up to now
        return Math.max(0, (Date.now() - new Date(s.start_time).getTime()) / 3600000);
      })();

      const key = s.task_id ?? `notask:${s.title || s.custom_task_type || 'Sans tâche'}`;
      const label = s.task?.title || s.title || s.custom_task_type || 'Sans tâche';
      const userName = data.userNames[s.user_id] || 'Utilisateur';

      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          taskStatus: s.task?.status ?? null,
          equipmentName: s.equipment?.name ?? null,
          totalHours: 0,
          sessions: 0,
          perUser: new Map(),
          lastStart: s.start_time,
        });
      }
      const g = map.get(key)!;
      g.totalHours += dur;
      g.sessions += 1;
      if (s.start_time > g.lastStart) g.lastStart = s.start_time;
      const u = g.perUser.get(s.user_id) || { name: userName, hours: 0, sessions: 0 };
      u.hours += dur;
      u.sessions += 1;
      g.perUser.set(s.user_id, u);
    }

    return Array.from(map.values())
      .map(g => ({ ...g, perUserList: Array.from(g.perUser.values()).sort((a, b) => b.hours - a.hours) }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [data, filteredSessions]);

  const summary = useMemo(() => {
    const totalHours = grouped.reduce((sum, g) => sum + g.totalHours, 0);
    const totalSessions = grouped.reduce((sum, g) => sum + g.sessions, 0);
    const employees = new Set<string>();
    grouped.forEach(g => g.perUser.forEach((_, k) => employees.add(k)));
    return {
      totalHours,
      totalSessions,
      tasks: grouped.length,
      employees: employees.size,
    };
  }, [grouped]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const cards = [
    { icon: Clock, label: `Heures totales (${RANGE_LABELS[range].short})`, value: formatHours(summary.totalHours), tone: 'text-sky-700 bg-sky-100' },
    { icon: ListChecks, label: 'Tâches suivies', value: summary.tasks, tone: 'text-emerald-700 bg-emerald-100' },
    { icon: Activity, label: 'Sessions', value: summary.totalSessions, tone: 'text-primary bg-primary/10' },
    { icon: Users, label: 'Employés actifs', value: summary.employees, tone: 'text-amber-700 bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-md flex items-center justify-center mb-2 ${c.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xl font-bold leading-none">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Période :</span>
          <Select value={range} onValueChange={(v) => setRange(v as TaskHoursRange)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="all">Tout l'historique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Personne :</span>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Tous les employés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {userOptions.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail par tâche — {RANGE_LABELS[range].long}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {grouped.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune heure suivie sur la période sélectionnée.
            </div>
          ) : (
            <ul className="divide-y">
              {grouped.map(g => (
                <li key={g.key} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{g.label}</span>
                        {g.taskStatus && (
                          <Badge variant={g.taskStatus === 'done' ? 'secondary' : 'outline'} className="text-[10px]">
                            {g.taskStatus === 'done' ? 'Terminée' : g.taskStatus}
                          </Badge>
                        )}
                        {g.equipmentName && (
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Wrench className="h-3 w-3" />{g.equipmentName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Dernière activité : {format(new Date(g.lastStart), 'd MMM, HH:mm', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold">{formatHours(g.totalHours)}</div>
                      <div className="text-[11px] text-muted-foreground">{g.sessions} session{g.sessions > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.perUserList.map((u, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px]">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {u.name}
                        <span className="text-muted-foreground">·</span>
                        <span className="font-medium">{formatHours(u.hours)}</span>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskHoursTab;