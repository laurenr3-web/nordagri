import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type RecentActivityKind = 'task_done' | 'point_created' | 'point_event';

export interface RecentActivityItem {
  id: string;
  kind: RecentActivityKind;
  title: string;
  timestamp: string;
  link: string;
}

export function useRecentActivityData(farmId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity', farmId],
    enabled: !!farmId && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<RecentActivityItem[]> => {
      // Fetch farm points first to scope events client-side (no FK declared on point_events)
      const farmPointsRes = await supabase
        .from('points')
        .select('id, title, entity_label, created_at')
        .eq('farm_id', farmId!);

      const farmPoints = farmPointsRes.data ?? [];
      const farmPointIds = farmPoints.map((p) => p.id);
      const pointById = new Map(farmPoints.map((p) => [p.id, p]));

      const [tasksRes, eventsRes] = await Promise.all([
        supabase
          .from('planning_tasks')
          .select('id, title, completed_at')
          .eq('farm_id', farmId!)
          .eq('status', 'done')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5),
        farmPointIds.length > 0
          ? supabase
              .from('point_events')
              .select('id, point_id, event_type, created_at')
              .in('point_id', farmPointIds)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      const items: RecentActivityItem[] = [];

      for (const t of tasksRes.data ?? []) {
        items.push({
          id: `task-${t.id}`,
          kind: 'task_done',
          title: `Tâche « ${t.title} » complétée`,
          timestamp: t.completed_at as string,
          link: '/planning',
        });
      }

      // Sort points by created_at desc and take top 5
      const recentPoints = [...farmPoints]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5);
      for (const p of recentPoints) {
        const label = p.entity_label || p.title;
        items.push({
          id: `point-${p.id}`,
          kind: 'point_created',
          title: `Point ajouté : ${label}`,
          timestamp: p.created_at,
          link: '/points',
        });
      }

      for (const e of (eventsRes.data ?? []) as any[]) {
        const point = pointById.get(e.point_id);
        const label = point?.entity_label || point?.title || 'point';
        items.push({
          id: `event-${e.id}`,
          kind: 'point_event',
          title: `Événement sur ${label}`,
          timestamp: e.created_at,
          link: '/points',
        });
      }

      return items
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 5);
    },
  });
}