import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaskHoursSession {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  status: string | null;
  title: string | null;
  custom_task_type: string | null;
  task: { id: string; title: string; status: string } | null;
  equipment: { id: number; name: string } | null;
}

export type TaskHoursRange = 'today' | '7d' | '30d' | 'all';

function computeSince(range: TaskHoursRange): string | null {
  const now = Date.now();
  switch (range) {
    case 'today': {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case '7d':
      return new Date(now - 7 * 24 * 3600 * 1000).toISOString();
    case '30d':
      return new Date(now - 30 * 24 * 3600 * 1000).toISOString();
    case 'all':
    default:
      return null;
  }
}

export function useTaskHoursLast7Days(farmId: string | null, range: TaskHoursRange = '7d') {
  return useQuery({
    queryKey: ['task-hours', farmId, range],
    enabled: !!farmId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<{ sessions: TaskHoursSession[]; userNames: Record<string, string> }> => {
      const since = computeSince(range);

      // Resolve farm members (owner + farm_members)
      const [{ data: farm }, { data: members }] = await Promise.all([
        supabase.from('farms').select('owner_id').eq('id', farmId!).maybeSingle(),
        supabase.from('farm_members').select('user_id').eq('farm_id', farmId!),
      ]);
      const userIds = new Set<string>();
      if (farm?.owner_id) userIds.add(farm.owner_id);
      (members ?? []).forEach((m: any) => m.user_id && userIds.add(m.user_id));

      if (userIds.size === 0) return { sessions: [], userNames: {} };

      const ids = Array.from(userIds);

      let query = supabase
        .from('time_sessions')
        .select(`
          id, user_id, task_id, start_time, end_time, duration, status, title, custom_task_type,
          task:planning_tasks!task_id(id, title, status),
          equipment:equipment_id(id, name)
        `)
        .in('user_id', ids)
        .order('start_time', { ascending: false });
      if (since) query = query.gte('start_time', since);

      const [{ data: sessions }, { data: profiles }] = await Promise.all([
        query,
        supabase.from('profiles').select('id, first_name, last_name').in('id', ids),
      ]);

      const userNames: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => {
        userNames[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Utilisateur';
      });

      return { sessions: (sessions ?? []) as any, userNames };
    },
  });
}
