import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, ListChecks, Users, Activity, Wrench } from 'lucide-react';
import { useFarmId } from '@/hooks/useFarmId';
import { useTaskHoursLast7Days } from '@/hooks/time-tracking/useTaskHoursLast7Days';
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

const TaskHoursTab: React.FC = () => {
  const { farmId } = useFarmId();
  const { data, isLoading } = useTaskHoursLast7Days(farmId);

  const grouped = useMemo(() => {
    if (!data) return [];
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

    for (const s of data.sessions) {
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
  }, [data]);

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
    { icon: Clock, label: 'Heures totales (7 j)', value: formatHours(summary.totalHours), tone: 'text-sky-700 bg-sky-100' },
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail par tâche — 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {grouped.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune heure suivie sur les 7 derniers jours.
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