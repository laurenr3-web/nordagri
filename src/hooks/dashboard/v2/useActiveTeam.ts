import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!farmId) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-v2', 'activeTeam', farmId] });
      queryClient.invalidateQueries({ queryKey: ['farm-team-status', farmId] });
    };
    const channel = supabase
      .channel(`active-team-${farmId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_shifts', filter: `farm_id=eq.${farmId}` },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_sessions' },
        invalidate,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId, queryClient]);

  return useQuery({
    queryKey: ['dashboard-v2', 'activeTeam', farmId],
    enabled: !!farmId,
    staleTime: 30_000,
    queryFn: async (): Promise<ActiveTeamMember[]> => {
      // Source of truth = work_shifts (RLS visible by farm members)
      const { data: shifts, error: shiftsErr } = await supabase
        .from('work_shifts')
        .select('id, user_id, punch_in_at')
        .eq('farm_id', farmId!)
        .eq('status', 'active')
        .order('punch_in_at', { ascending: false });
      if (shiftsErr) throw shiftsErr;
      if (!shifts || shifts.length === 0) return [];

      const userIds = Array.from(new Set(shifts.map((s: any) => s.user_id)));

      const [{ data: profiles }, { data: sessions }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds),
        supabase
          .from('time_sessions')
          .select('user_id, equipment_id, title, description, poste_travail, equipment_ref:equipment_id(name)')
          .in('user_id', userIds)
          .eq('status', 'active'),
      ]);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const sessionMap = new Map<string, any>();
      (sessions ?? []).forEach((s: any) => {
        if (!sessionMap.has(s.user_id)) sessionMap.set(s.user_id, s);
      });

      return shifts.map((sh: any) => {
        const p = profileMap.get(sh.user_id) as any;
        const name = p
          ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Membre'
          : 'Membre';
        const sess = sessionMap.get(sh.user_id);
        const title = sess
          ? (sess.title || sess.description || sess.poste_travail || 'Session active')
          : 'Session active';
        return {
          sessionId: sh.id,
          userId: sh.user_id,
          name,
          avatarUrl: p?.avatar_url ?? null,
          equipmentName: sess?.equipment_ref?.name ?? null,
          startTime: sh.punch_in_at,
          title,
        };
      });
    },
  });
}
