import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StatsPeriod = 'today' | 'week' | 'month';

export interface PerEmployee {
  user_id: string;
  count: number;
}

export interface OperationalStats {
  tasks: {
    done: number;
    overdue: number;
    inProgress: number;
    perEmployee: PerEmployee[];
    topEmployeeId: string | null;
  };
  points: {
    open: number;
    resolved: number;
    forgotten: number;
    avgResolutionDays: number | null;
  };
  reactivity: {
    avgFirstActionHours: number | null;
    avgCompletionHours: number | null;
  };
}

/**
 * Aggregates operational KPIs (tasks, points, reactivity) for the selected farm
 * over the chosen period. Computation is delegated to the `get_operational_stats`
 * Postgres function for a single, indexed round-trip — no full-table downloads.
 */
export function useOperationalStats(
  farmId: string | null,
  period: StatsPeriod,
  employeeId: string | null = null,
) {
  return useQuery<OperationalStats>({
    queryKey: ['operationalStats', farmId, period, employeeId ?? 'all'],
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('get_operational_stats', {
        _farm_id: farmId!,
        _period: period,
        _employee_id: employeeId,
      });
      if (error) throw error;

      const empty: OperationalStats = {
        tasks: { done: 0, overdue: 0, inProgress: 0, perEmployee: [], topEmployeeId: null },
        points: { open: 0, resolved: 0, forgotten: 0, avgResolutionDays: null },
        reactivity: { avgFirstActionHours: null, avgCompletionHours: null },
      };
      if (!data) return empty;

      const d = data as any;
      const toNumOrNull = (v: any): number | null =>
        v === null || v === undefined ? null : Number(v);

      return {
        tasks: {
          done: Number(d.tasks?.done ?? 0),
          overdue: Number(d.tasks?.overdue ?? 0),
          inProgress: Number(d.tasks?.inProgress ?? 0),
          perEmployee: Array.isArray(d.tasks?.perEmployee)
            ? d.tasks.perEmployee.map((row: any) => ({
                user_id: String(row.user_id),
                count: Number(row.count ?? 0),
              }))
            : [],
          topEmployeeId: d.tasks?.topEmployeeId ?? null,
        },
        points: {
          open: Number(d.points?.open ?? 0),
          resolved: Number(d.points?.resolved ?? 0),
          forgotten: Number(d.points?.forgotten ?? 0),
          avgResolutionDays: toNumOrNull(d.points?.avgResolutionDays),
        },
        reactivity: {
          avgFirstActionHours: toNumOrNull(d.reactivity?.avgFirstActionHours),
          avgCompletionHours: toNumOrNull(d.reactivity?.avgCompletionHours),
        },
      };
    },
  });
}