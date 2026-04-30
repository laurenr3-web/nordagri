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
      const now = Date.now();
      // Score d'urgence : priorité (poids fort) + ancienneté sans mise à jour (poids faible).
      // Un point critique reste toujours devant un important, mais à priorité égale,
      // celui négligé depuis le plus longtemps remonte en premier.
      const urgencyScore = (p: PointWatchItem) => {
        const pr = priorityRank[p.priority] ?? 2;
        const last = p.last_event_at ? new Date(p.last_event_at).getTime() : now;
        const daysStale = Math.max(0, (now - last) / (1000 * 60 * 60 * 24));
        // priorité dominante (×1000), ancienneté soustraite pour faire remonter les plus vieux
        return pr * 1000 - Math.min(daysStale, 365);
      };
      const sorted = [...all].sort((a, b) => urgencyScore(a) - urgencyScore(b));

      return {
        total: all.length,
        importantCount: all.filter((p) => p.priority === 'important').length,
        criticalCount: all.filter((p) => p.priority === 'critical').length,
        examples: sorted.slice(0, 2),
      };
    },
  });
}