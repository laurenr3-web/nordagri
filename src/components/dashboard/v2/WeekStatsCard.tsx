import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Wrench, AlertCircle, Clock } from 'lucide-react';

interface Props {
  farmId: string | null;
  /** When true, renders the mobile-optimized 2x2 layout with larger numbers. */
  compact?: boolean;
}

export const WeekStatsCard: React.FC<Props> = ({ farmId, compact = false }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-v2', 'week-stats', farmId],
    enabled: !!farmId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
      const todayISO = now.toISOString().slice(0, 10);

      const [{ data: doneTasks }, { data: openMaint }, { data: lateMaint }, { data: sessions }] =
        await Promise.all([
          supabase
            .from('planning_tasks')
            .select('id, completed_at')
            .eq('farm_id', farmId!)
            .eq('status', 'done')
            .gte('completed_at', weekAgo),
          supabase
            .from('maintenance_tasks')
            .select('id, status, equipment_ref:equipment_id(farm_id)')
            .neq('status', 'completed'),
          supabase
            .from('maintenance_tasks')
            .select('id, due_date, equipment_ref:equipment_id(farm_id)')
            .neq('status', 'completed')
            .lt('due_date', todayISO),
          supabase
            .from('time_sessions')
            .select('start_time, end_time, status')
            .gte('start_time', weekAgo),
        ]);

      const openCount = (openMaint ?? []).filter((m: any) => m.equipment_ref?.farm_id === farmId).length;
      const lateCount = (lateMaint ?? []).filter((m: any) => m.equipment_ref?.farm_id === farmId).length;

      let totalMs = 0;
      (sessions ?? []).forEach((s: any) => {
        const start = new Date(s.start_time).getTime();
        const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
        totalMs += Math.max(0, end - start);
      });
      const hours = Math.round(totalMs / (1000 * 3600));

      return {
        tasksDone: (doneTasks ?? []).length,
        maintenanceOpen: openCount,
        maintenanceLate: lateCount,
        hoursTracked: hours,
      };
    },
  });

  const cells = [
    { icon: Calendar, label: 'Tâches terminées', value: data?.tasksDone ?? 0, tone: 'text-emerald-700 bg-emerald-100', href: buildTabUrl('planning', 'completed') },
    { icon: Wrench, label: 'Maintenance ouverte', value: data?.maintenanceOpen ?? 0, tone: 'text-primary bg-primary/10', href: '/maintenance' },
    { icon: AlertCircle, label: 'En retard', value: data?.maintenanceLate ?? 0, tone: 'text-amber-700 bg-amber-100', href: '/maintenance?filter=late' },
    { icon: Clock, label: 'Heures suivies', value: data ? `${data.hoursTracked} h` : '0 h', tone: 'text-sky-700 bg-sky-100', href: buildTabUrl('timeStatistics', 'hours') },
  ];

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Statistiques cette semaine</h3>
      </div>
      <div
        className={
          compact
            ? 'p-3 grid grid-cols-2 gap-3'
            : 'p-3 grid grid-cols-2 xl:grid-cols-4 gap-2'
        }
      >
        {cells.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => navigate(c.href)}
              aria-label={`Voir ${c.label}`}
              className={
                compact
                  ? 'rounded-xl border bg-background p-4 min-w-0 text-left w-full hover:bg-accent/50 hover:border-primary/30 transition-colors cursor-pointer'
                  : 'rounded-lg border bg-background p-3 min-w-0 text-left w-full hover:bg-accent/50 hover:border-primary/30 transition-colors cursor-pointer'
              }
            >
              <div
                className={`shrink-0 rounded-md flex items-center justify-center mb-2 ${c.tone} ${
                  compact ? 'h-8 w-8' : 'h-7 w-7'
                }`}
              >
                <Icon className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
              </div>
              <div
                className={
                  compact
                    ? 'text-2xl font-bold leading-none'
                    : 'text-lg font-bold leading-none'
                }
              >
                {isLoading ? '—' : c.value}
              </div>
              <div
                className={
                  compact
                    ? 'text-xs text-muted-foreground mt-1.5 leading-tight'
                    : 'text-[10px] text-muted-foreground mt-1 truncate'
                }
              >
                {c.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
