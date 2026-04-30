import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CheckTodayData {
  forgottenPointsCount: number;
  forgottenPointsMaxDays: number;
  overdueTasksCount: number;
  dueChecksCount: number;
}

export function useCheckTodayData(farmId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'checkToday', farmId],
    enabled: !!farmId && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CheckTodayData> => {
      const todayStr = new Date().toISOString().split('T')[0];
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoIso = threeDaysAgo.toISOString();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const endOfTodayIso = endOfToday.toISOString();

      const [pointsRes, tasksRes, dueChecksRes] = await Promise.all([
        supabase
          .from('points')
          .select('id, last_event_at')
          .eq('farm_id', farmId!)
          .in('status', ['open', 'watch'])
          .lt('last_event_at', threeDaysAgoIso),
        supabase
          .from('planning_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('farm_id', farmId!)
          .lt('due_date', todayStr)
          .neq('status', 'done'),
        supabase
          .from('points')
          .select('id', { count: 'exact', head: true })
          .eq('farm_id', farmId!)
          .in('status', ['open', 'watch'])
          .not('next_check_at', 'is', null)
          .lte('next_check_at', endOfTodayIso),
      ]);

      const forgotten = pointsRes.data ?? [];
      const now = Date.now();
      let maxDays = 0;
      for (const p of forgotten) {
        const diff = Math.floor(
          (now - new Date(p.last_event_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff > maxDays) maxDays = diff;
      }

      return {
        forgottenPointsCount: forgotten.length,
        forgottenPointsMaxDays: maxDays,
        overdueTasksCount: tasksRes.count ?? 0,
        dueChecksCount: dueChecksRes.count ?? 0,
      };
    },
  });
}