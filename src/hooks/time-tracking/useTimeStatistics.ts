
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter,
  subMonths,
  format 
} from 'date-fns';

export type TimeRange = 'week' | 'month' | 'quarter';

export interface EmployeeStats {
  userId: string;
  employeeName: string;
  hours: number;
  sessions: number;
}

export interface EquipmentStats {
  equipmentId: number;
  equipmentName: string | null;
  hours: number;
}

export interface HoursSummary {
  week: number;
  month: number;
  quarter: number;
}

export function useTimeStatistics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStats[]>([]);
  const [hoursSummary, setHoursSummary] = useState<HoursSummary>({
    week: 0,
    month: 0,
    quarter: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'quarter':
        return {
          start: startOfQuarter(now),
          end: endOfQuarter(now)
        };
      default:
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
    }
  };

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange(timeRange);
      
      // Get current user's farm_id
      const { data: profileData } = await supabase.auth.getUser();
      if (!profileData.user) {
        console.error("User not authenticated");
        setIsLoading(false);
        return;
      }

      // Get user's profile to access farm_id
      const { data: userData } = await supabase
        .from('profiles')
        .select('farm_id')
        .eq('id', profileData.user.id)
        .single();
      
      if (!userData?.farm_id) {
        console.error("User has no farm_id");
        setIsLoading(false);
        return;
      }

      // Fetch all profiles in the same farm (for employee names)
      const { data: farmProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('farm_id', userData.farm_id);
      
      // Create a map of user_id to name
      const userNameMap = new Map();
      farmProfiles?.forEach(profile => {
        const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur';
        userNameMap.set(profile.id, name);
      });

      // Resolve farm member user_ids (owner + members) so we include
      // sessions from every member of the active farm.
      const memberUserIds = new Set<string>();
      const { data: ownerRow } = await supabase
        .from('farms')
        .select('owner_id')
        .eq('id', userData.farm_id)
        .maybeSingle();
      if (ownerRow?.owner_id) memberUserIds.add(ownerRow.owner_id);
      const { data: members } = await supabase
        .from('farm_members')
        .select('user_id')
        .eq('farm_id', userData.farm_id);
      members?.forEach((m: any) => m.user_id && memberUserIds.add(m.user_id));
      const userIds = Array.from(memberUserIds);

      // We need a wide enough window to compute week/month/quarter summaries
      // independently of the active range filter.
      const quarterRange = getDateRange('quarter');
      const weekRange = getDateRange('week');
      const monthRange = getDateRange('month');
      const lowerBound = new Date(Math.min(
        quarterRange.start.getTime(),
        weekRange.start.getTime(),
        monthRange.start.getTime(),
        start.getTime(),
      ));
      const upperBound = new Date(Math.max(
        quarterRange.end.getTime(),
        weekRange.end.getTime(),
        monthRange.end.getTime(),
        end.getTime(),
      ));

      // Fetch completed sessions for all farm members in the wide window.
      let query = supabase
        .from('time_sessions')
        .select(`
          id,
          user_id,
          equipment_id,
          start_time,
          end_time,
          duration,
          equipment:equipment_id (name)
        `)
        .gte('start_time', lowerBound.toISOString())
        .lte('start_time', upperBound.toISOString())
        .not('end_time', 'is', null);

      if (userIds.length > 0) {
        query = query.in('user_id', userIds);
      }

      const { data: rawSessions, error: sessionsError } = await query;
      if (sessionsError) {
        console.error('Error loading time_sessions:', sessionsError);
      }

      // Compute duration (hours) from start/end when the column is NULL.
      const sessions = (rawSessions ?? []).map((s: any) => {
        let hours = typeof s.duration === 'number' ? s.duration : 0;
        if ((!hours || hours <= 0) && s.start_time && s.end_time) {
          const ms = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
          if (Number.isFinite(ms) && ms > 0) hours = ms / (1000 * 60 * 60);
        }
        return { ...s, _hours: hours };
      });

      // Restrict to active range for breakdown stats.
      const inRange = sessions.filter(s => {
        const d = new Date(s.start_time);
        return d >= start && d <= end;
      });

      // Process employee statistics (hours + session counts)
      const employeeData = new Map<string, { hours: number; sessions: number }>();
      inRange.forEach(session => {
        if (!session.user_id) return;
        const current = employeeData.get(session.user_id) || { hours: 0, sessions: 0 };
        employeeData.set(session.user_id, {
          hours: current.hours + session._hours,
          sessions: current.sessions + 1,
        });
      });

      const employeeStatsArray: EmployeeStats[] = Array.from(employeeData.entries())
        .map(([userId, data]) => ({
          userId,
          employeeName: userNameMap.get(userId) || 'Utilisateur',
          hours: data.hours,
          sessions: data.sessions,
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10);  // Get top 10

      // Process equipment statistics
      const equipmentData = new Map<number, { name: string | null; hours: number }>();
      inRange.forEach(session => {
        if (!session.equipment_id) return;
        const equipId = session.equipment_id;
        const equipmentName = session.equipment && typeof session.equipment === 'object'
          ? (session.equipment as any).name
          : null;
        const current = equipmentData.get(equipId) || { name: equipmentName, hours: 0 };
        equipmentData.set(equipId, { name: current.name ?? equipmentName, hours: current.hours + session._hours });
      });

      const equipmentStatsArray: EquipmentStats[] = Array.from(equipmentData.entries())
        .map(([equipmentId, data]) => ({
          equipmentId,
          equipmentName: data.name,
          hours: data.hours
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);  // Get top 5

      // Summary uses the full wide-window dataset.
      const weekHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= weekRange.start && date <= weekRange.end;
        })
        .reduce((sum, s) => sum + s._hours, 0);

      const monthHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= monthRange.start && date <= monthRange.end;
        })
        .reduce((sum, s) => sum + s._hours, 0);

      const quarterHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= quarterRange.start && date <= quarterRange.end;
        })
        .reduce((sum, s) => sum + s._hours, 0);

      setEmployeeStats(employeeStatsArray);
      setEquipmentStats(equipmentStatsArray);
      setHoursSummary({
        week: weekHours,
        month: monthHours,
        quarter: quarterHours
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    employeeStats,
    equipmentStats,
    hoursSummary,
    isLoading,
    timeRange,
    setTimeRange
  };
}
