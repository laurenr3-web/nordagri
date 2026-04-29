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
      const [tasksRes, pointsRes, eventsRes] = await Promise.all([
        supabase
          .from('planning_tasks')
          .select('id, title, completed_at')
          .eq('farm_id', farmId!)
          .eq('status', 'done')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase
          .from('points')
          .select('id, title, entity_label, created_at')
          .eq('farm_id', farmId!)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('point_events')
          .select('id, point_id, event_type, note, created_at, points!inner(farm_id, title, entity_label)')
          .eq('points.farm_id', farmId!)
          .order('created_at', { ascending: false })
          .limit(5),
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

      for (const p of pointsRes.data ?? []) {
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
        const label = e.points?.entity_label || e.points?.title || 'point';
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