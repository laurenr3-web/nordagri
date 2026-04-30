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

function getRange(period: StatsPeriod): { fromIso: string; toIso: string; fromDate: string; toDate: string } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  if (period === 'week') {
    from.setDate(from.getDate() - 6);
  } else if (period === 'month') {
    from.setDate(from.getDate() - 29);
  }

  const toIsoDate = (d: Date) => d.toISOString().split('T')[0];
  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    fromDate: toIsoDate(from),
    toDate: toIsoDate(to),
  };
}

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Aggregates operational KPIs (tasks, points, reactivity) for the selected farm
 * over the chosen period. All filtering is client-side over small per-farm datasets.
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
      const { fromIso, toIso } = getRange(period);
      const todayStr = new Date().toISOString().split('T')[0];
      const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();

      // ---------- Tasks ----------
      let tasksQuery = supabase
        .from('planning_tasks')
        .select('id, status, due_date, completed_at, completed_by, created_at, assigned_to, created_by')
        .eq('farm_id', farmId!);
      // Employee filter: a task is "linked" to a person if they are assigned,
      // they completed it, or (fallback) they created it.
      if (employeeId) {
        tasksQuery = tasksQuery.or(
          `assigned_to.eq.${employeeId},completed_by.eq.${employeeId},created_by.eq.${employeeId}`,
        );
      }
      const { data: tasks, error: tasksErr } = await tasksQuery;
      if (tasksErr) throw tasksErr;

      const allTasks = tasks ?? [];
      const doneInPeriod = allTasks.filter(
        (t) => t.status === 'done' && t.completed_at && t.completed_at >= fromIso && t.completed_at <= toIso,
      );
      const overdue = allTasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date < todayStr).length;
      // tasks active whose due_date falls in [from..to]
      const fromDateOnly = fromIso.slice(0, 10);
      const toDateOnly = toIso.slice(0, 10);
      const inProgressCount = allTasks.filter(
        (t) =>
          t.status !== 'done' &&
          t.due_date &&
          t.due_date >= fromDateOnly &&
          t.due_date <= toDateOnly,
      ).length;

      const perEmployeeMap = new Map<string, number>();
      for (const t of doneInPeriod) {
        if (!t.completed_by) continue;
        perEmployeeMap.set(t.completed_by, (perEmployeeMap.get(t.completed_by) ?? 0) + 1);
      }
      const perEmployee: PerEmployee[] = Array.from(perEmployeeMap.entries())
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count);

      const completionHours = doneInPeriod
        .filter((t) => t.completed_at && t.created_at)
        .map(
          (t) =>
            (new Date(t.completed_at as string).getTime() - new Date(t.created_at as string).getTime()) /
            3_600_000,
        )
        .filter((h) => h >= 0);

      // ---------- Points ----------
      let pointsQuery = supabase
        .from('points')
        .select('id, status, created_at, resolved_at, last_event_at')
        .eq('farm_id', farmId!);
      if (employeeId) {
        // Filter to points either created by the user or that have any event from the user.
        const { data: userEvents } = await supabase
          .from('point_events')
          .select('point_id')
          .eq('created_by', employeeId);
        const eventPointIds = Array.from(new Set((userEvents ?? []).map((e) => e.point_id))).filter(Boolean);
        if (eventPointIds.length > 0) {
          const idList = eventPointIds.map((id) => `"${id}"`).join(',');
          pointsQuery = pointsQuery.or(`created_by.eq.${employeeId},id.in.(${idList})`);
        } else {
          pointsQuery = pointsQuery.eq('created_by', employeeId);
        }
      }
      const { data: points, error: pointsErr } = await pointsQuery;
      if (pointsErr) throw pointsErr;

      const allPoints = points ?? [];
      const open = allPoints.filter((p) => p.status !== 'resolved').length;
      const resolved = allPoints.filter(
        (p) => p.resolved_at && p.resolved_at >= fromIso && p.resolved_at <= toIso,
      );
      const forgotten = allPoints.filter(
        (p) => p.status !== 'resolved' && p.last_event_at && p.last_event_at < threeDaysAgoIso,
      ).length;

      const resolutionDays = resolved
        .filter((p) => p.created_at && p.resolved_at)
        .map(
          (p) =>
            (new Date(p.resolved_at as string).getTime() - new Date(p.created_at as string).getTime()) /
            (24 * 3_600_000),
        )
        .filter((d) => d >= 0);

      // ---------- Reactivity: time to first action on points created in period ----------
      const pointsCreatedInPeriod = allPoints.filter(
        (p) => p.created_at >= fromIso && p.created_at <= toIso,
      );
      let avgFirstActionHours: number | null = null;
      if (pointsCreatedInPeriod.length) {
        const ids = pointsCreatedInPeriod.map((p) => p.id);
        const { data: events } = await supabase
          .from('point_events')
          .select('point_id, event_type, created_at')
          .in('point_id', ids)
          .in('event_type', ['action', 'correction'])
          .order('created_at', { ascending: true });
        const firstByPoint = new Map<string, string>();
        for (const e of events ?? []) {
          if (!firstByPoint.has(e.point_id)) firstByPoint.set(e.point_id, e.created_at);
        }
        const hours: number[] = [];
        for (const p of pointsCreatedInPeriod) {
          const first = firstByPoint.get(p.id);
          if (first) {
            const h =
              (new Date(first).getTime() - new Date(p.created_at).getTime()) / 3_600_000;
            if (h >= 0) hours.push(h);
          }
        }
        avgFirstActionHours = avg(hours);
      }

      return {
        tasks: {
          done: doneInPeriod.length,
          overdue,
          inProgress: inProgressCount,
          perEmployee,
          topEmployeeId: perEmployee[0]?.user_id ?? null,
        },
        points: {
          open,
          resolved: resolved.length,
          forgotten,
          avgResolutionDays: avg(resolutionDays),
        },
        reactivity: {
          avgFirstActionHours,
          avgCompletionHours: avg(completionHours),
        },
      };
    },
  });
}