import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FarmTeamMemberStatus {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  isActive: boolean;
  shiftStart: string | null;
  currentTitle: string | null;
  currentEquipment: string | null;
  lastActivity: string | null;
  todayTaskCount: number;
  completedTodayCount: number;
  completedWeekCount: number;
  completedTotalMinutes: number;
  lastCompletedAt: string | null;
  lastCompletedTitle: string | null;
  lastCompletedEquipment: string | null;
}

export function useFarmTeamStatus(farmId: string | null) {
  return useQuery({
    queryKey: ['time-tracking', 'farmTeamStatus', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async (): Promise<FarmTeamMemberStatus[]> => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const weekStart = new Date(today);
      const day = (weekStart.getDay() + 6) % 7; // Monday-based
      weekStart.setDate(weekStart.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartIso = weekStart.toISOString();

      const [{ data: farm }, { data: members }] = await Promise.all([
        supabase.from('farms').select('owner_id').eq('id', farmId!).maybeSingle(),
        supabase.from('farm_members').select('user_id, role').eq('farm_id', farmId!),
      ]);

      const roleMap = new Map<string, FarmTeamMemberStatus['role']>();
      if (farm?.owner_id) roleMap.set(farm.owner_id, 'owner');
      (members ?? []).forEach((m: any) => {
        if (!roleMap.has(m.user_id)) {
          roleMap.set(m.user_id, (m.role as any) ?? 'member');
        }
      });
      const userIds = Array.from(roleMap.keys());
      if (userIds.length === 0) return [];

      const [
        { data: profiles },
        { data: shifts },
        { data: sessions },
        { data: tasks },
        { data: completedSessions },
      ] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', userIds),
          supabase
            .from('work_shifts')
            .select('user_id, status, punch_in_at, punch_out_at')
            .eq('farm_id', farmId!)
            .in('user_id', userIds)
            .order('punch_in_at', { ascending: false })
            .limit(200),
          supabase
            .from('time_sessions')
            .select('user_id, title, description, poste_travail, equipment_id, equipment_ref:equipment_id(name)')
            .in('user_id', userIds)
            .eq('status', 'active'),
          supabase
            .from('planning_tasks')
            .select('assigned_to')
            .eq('farm_id', farmId!)
            .eq('due_date', todayStr)
            .neq('status', 'done')
            .not('assigned_to', 'is', null),
          supabase
            .from('time_sessions')
            .select('user_id, title, description, poste_travail, custom_task_type, start_time, end_time, duration, equipment_id, equipment_ref:equipment_id(name)')
            .in('user_id', userIds)
            .eq('status', 'completed')
            .gte('end_time', weekStartIso)
            .order('end_time', { ascending: false })
            .limit(500),
        ]);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const activeShift = new Map<string, any>();
      const lastShift = new Map<string, string>();
      (shifts ?? []).forEach((sh: any) => {
        if (sh.status === 'active' && !activeShift.has(sh.user_id)) {
          activeShift.set(sh.user_id, sh);
        }
        const end = sh.punch_out_at ?? sh.punch_in_at;
        const cur = lastShift.get(sh.user_id);
        if (!cur || (end && end > cur)) lastShift.set(sh.user_id, end);
      });
      const sessionMap = new Map<string, any>();
      (sessions ?? []).forEach((s: any) => {
        if (!sessionMap.has(s.user_id)) sessionMap.set(s.user_id, s);
      });
      const taskCount = new Map<string, number>();
      (tasks ?? []).forEach((t: any) => {
        if (!t.assigned_to) return;
        taskCount.set(t.assigned_to, (taskCount.get(t.assigned_to) ?? 0) + 1);
      });

      const completedTodayCount = new Map<string, number>();
      const completedWeekCount = new Map<string, number>();
      const completedTotalMinutes = new Map<string, number>();
      const lastCompleted = new Map<string, any>();
      (completedSessions ?? []).forEach((s: any) => {
        if (!s.user_id || !s.end_time) return;
        completedWeekCount.set(s.user_id, (completedWeekCount.get(s.user_id) ?? 0) + 1);
        if (s.end_time >= startOfToday) {
          completedTodayCount.set(s.user_id, (completedTodayCount.get(s.user_id) ?? 0) + 1);
        }
        let mins = 0;
        if (typeof s.duration === 'number' && s.duration > 0) {
          mins = Math.round(s.duration / 60);
        } else if (s.start_time && s.end_time) {
          mins = Math.max(0, Math.round((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000));
        }
        completedTotalMinutes.set(s.user_id, (completedTotalMinutes.get(s.user_id) ?? 0) + mins);
        if (!lastCompleted.has(s.user_id)) lastCompleted.set(s.user_id, s);
      });

      const result: FarmTeamMemberStatus[] = userIds.map((uid) => {
        const p = profileMap.get(uid) as any;
        const name = p
          ? [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Membre'
          : 'Membre';
        const sh = activeShift.get(uid);
        const sess = sessionMap.get(uid);
        const lc = lastCompleted.get(uid);
        const lastEnd = lc?.end_time ?? null;
        const lastShiftAt = lastShift.get(uid) ?? null;
        const lastActivity = [lastEnd, lastShiftAt].filter(Boolean).sort().pop() ?? null;
        return {
          userId: uid,
          name,
          avatarUrl: p?.avatar_url ?? null,
          role: roleMap.get(uid) ?? 'member',
          isActive: !!sh,
          shiftStart: sh?.punch_in_at ?? null,
          currentTitle: sess
            ? sess.title || sess.description || sess.poste_travail || 'Session active'
            : sh
              ? 'Session active'
              : null,
          currentEquipment: sess?.equipment_ref?.name ?? null,
          lastActivity,
          todayTaskCount: taskCount.get(uid) ?? 0,
          completedTodayCount: completedTodayCount.get(uid) ?? 0,
          completedWeekCount: completedWeekCount.get(uid) ?? 0,
          completedTotalMinutes: completedTotalMinutes.get(uid) ?? 0,
          lastCompletedAt: lastEnd,
          lastCompletedTitle: lc
            ? lc.title || lc.description || lc.custom_task_type || lc.poste_travail || null
            : null,
          lastCompletedEquipment: lc?.equipment_ref?.name ?? null,
        };
      });

      // Active first, then alpha
      return result.sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    },
  });
}
