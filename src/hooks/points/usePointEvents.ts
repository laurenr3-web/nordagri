import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PointEvent } from '@/types/Point';

export function usePointEvents(pointId: string | null) {
  return useQuery({
    queryKey: ['point-events', pointId],
    enabled: !!pointId,
    queryFn: async (): Promise<PointEvent[]> => {
      const { data, error } = await supabase
        .from('point_events')
        .select('*')
        .eq('point_id', pointId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PointEvent[];
    },
  });
}