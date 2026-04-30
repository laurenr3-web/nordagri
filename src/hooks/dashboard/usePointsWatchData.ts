import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PointWatchItem {
  id: string;
  title: string;
  entity_label: string | null;
  priority: 'critical' | 'important' | 'normal';
  status: 'open' | 'watch' | 'resolved';
  last_event_at: string;
}

export interface PointsWatchData {
  total: number;
  importantCount: number;
  criticalCount: number;
  examples: PointWatchItem[];
}

export function usePointsWatchData(farmId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'pointsWatch', farmId],
    enabled: !!farmId && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PointsWatchData> => {
      const { data, error } = await supabase
        .from('points')
        .select('id, title, entity_label, priority, status, last_event_at')
        .eq('farm_id', farmId!)
        .in('status', ['open', 'watch'])
        .order('last_event_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const all = (data ?? []) as PointWatchItem[];
      const priorityRank: Record<string, number> = { critical: 0, important: 1, normal: 2 };
      const sorted = [...all].sort((a, b) => {
        const diff = (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
        if (diff !== 0) return diff;
        return b.last_event_at.localeCompare(a.last_event_at);
      });

      return {
        total: all.length,
        importantCount: all.filter((p) => p.priority === 'important').length,
        criticalCount: all.filter((p) => p.priority === 'critical').length,
        examples: sorted.slice(0, 2),
      };
    },
  });
}