import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardSignals {
  activeUsers: number;
  unassignedTasks: number;
  lowStockParts: number;
  pointsToWatch: number;
}

export function useDashboardSignals(farmId: string | null) {
  return useQuery({
    queryKey: ['dashboard-v2', 'signals', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async (): Promise<DashboardSignals> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [activeRes, tasksRes, partsRes, pointsRes] = await Promise.all([
        supabase
          .from('work_shifts')
          .select('user_id')
          .eq('farm_id', farmId!)
          .eq('status', 'active'),
        supabase
          .from('planning_tasks')
          .select('id')
          .eq('farm_id', farmId!)
          .is('assigned_to', null)
          .neq('status', 'done'),
        supabase
          .from('parts_inventory')
          .select('id, quantity, reorder_threshold')
          .eq('farm_id', farmId!),
        supabase
          .from('points')
          .select('id')
          .eq('farm_id', farmId!)
          .in('status', ['open', 'watch']),
      ]);

      const uniqueUsers = new Set((activeRes.data ?? []).map((s: any) => s.user_id));
      const lowStock =
        (partsRes.data ?? []).filter(
          (p: any) => (p.quantity ?? 0) <= (p.reorder_threshold ?? 5)
        ).length;

      return {
        activeUsers: uniqueUsers.size,
        unassignedTasks: (tasksRes.data ?? []).length,
        lowStockParts: lowStock,
        pointsToWatch: (pointsRes.data ?? []).length,
      };
    },
  });
}
