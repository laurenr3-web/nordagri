import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Point, PointEventType, PointWithLastEvent } from '@/types/Point';

export function usePoints(farmId: string | null) {
  return useQuery({
    queryKey: ['points', farmId],
    enabled: !!farmId,
    queryFn: async (): Promise<PointWithLastEvent[]> => {
      const { data: points, error } = await supabase
        .from('points')
        .select('*')
        .eq('farm_id', farmId!)
        .order('last_event_at', { ascending: false });
      if (error) throw error;
      const list = (points ?? []) as Point[];
      if (list.length === 0) return [];

      // Fetch the latest event of each point in one query
      const ids = list.map((p) => p.id);
      const { data: events } = await supabase
        .from('point_events')
        .select('point_id, event_type, note, created_at')
        .in('point_id', ids)
        .order('created_at', { ascending: false });

      const lastByPoint = new Map<string, { event_type: PointEventType; note: string | null }>();
      (events ?? []).forEach((e: any) => {
        if (!lastByPoint.has(e.point_id)) {
          lastByPoint.set(e.point_id, { event_type: e.event_type, note: e.note });
        }
      });

      return list.map((p) => ({
        ...p,
        last_event_type: lastByPoint.get(p.id)?.event_type ?? null,
        last_event_note: lastByPoint.get(p.id)?.note ?? null,
      }));
    },
  });
}

export function usePoint(pointId: string | null) {
  return useQuery({
    queryKey: ['point', pointId],
    enabled: !!pointId,
    queryFn: async (): Promise<Point | null> => {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('id', pointId!)
        .maybeSingle();
      if (error) throw error;
      return data as Point | null;
    },
  });
}