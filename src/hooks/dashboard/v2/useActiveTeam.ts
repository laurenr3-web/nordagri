import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveTeamMember {
  sessionId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  equipmentName: string | null;
  startTime: string;
  title: string | null;
}

export function useActiveTeam(farmId: string | null) {
  return useQuery({
    queryKey: ['dashboard-v2', 'activeTeam', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async (): Promise<ActiveTeamMember[]> => {
      // Members of the farm (owner + members)
      const [{ data: farm }, { data: members }] = await Promise.all([
        supabase.from('farms').select('owner_id').eq('id', farmId!).maybeSingle(),
        supabase.from('farm_members').select('user_id').eq('farm_id', farmId!),
      ]);
      const userIds = new Set<string>();
      if (farm?.owner_id) userIds.add(farm.owner_id);
      (members ?? []).forEach((m: any) => userIds.add(m.user_id));
      if (userIds.size === 0) return [];

      const { data: sessions } = await supabase
        .from('time_sessions')
        .select('id, user_id, equipment_id, start_time, title, equipment_ref:equipment_id(name)')
        .eq('status', 'active')
        .in('user_id', Array.from(userIds))
        .order('start_time', { ascending: false });

      if (!sessions || sessions.length === 0) return [];

      const sessionUserIds = Array.from(new Set(sessions.map((s: any) => s.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', sessionUserIds);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

      return sessions.map((s: any) => {
        const p = profileMap.get(s.user_id) as any;
        const name = p
          ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Membre'
          : 'Membre';
        return {
          sessionId: s.id,
          userId: s.user_id,
          name,
          avatarUrl: p?.avatar_url ?? null,
          equipmentName: s.equipment_ref?.name ?? null,
          startTime: s.start_time,
          title: s.title ?? null,
        };
      });
    },
  });
}
