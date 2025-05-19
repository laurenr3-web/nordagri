
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

      // Fetch all time sessions in the specified time range
      const { data: sessions } = await supabase
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
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .not('end_time', 'is', null);

      if (!sessions) {
        setIsLoading(false);
        return;
      }

      // Process employee statistics
      const employeeData = new Map<string, number>();
      sessions.forEach(session => {
        if (!session.user_id) return;
        
        const hours = session.duration || 0;
        const current = employeeData.get(session.user_id) || 0;
        employeeData.set(session.user_id, current + hours);
      });

      const employeeStatsArray: EmployeeStats[] = Array.from(employeeData.entries())
        .map(([userId, hours]) => ({
          userId,
          employeeName: userNameMap.get(userId) || 'Utilisateur',
          hours
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10);  // Get top 10

      // Process equipment statistics
      const equipmentData = new Map<number, { name: string | null; hours: number }>();
      sessions.forEach(session => {
        if (!session.equipment_id) return;
        
        const equipId = session.equipment_id;
        const hours = session.duration || 0;
        // Fix: Access equipment name safely
        const equipmentName = session.equipment?.name || null;
        const current = equipmentData.get(equipId) || { name: equipmentName, hours: 0 };
        equipmentData.set(equipId, { name: current.name, hours: current.hours + hours });
      });

      const equipmentStatsArray: EquipmentStats[] = Array.from(equipmentData.entries())
        .map(([equipmentId, data]) => ({
          equipmentId,
          equipmentName: data.name,
          hours: data.hours
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);  // Get top 5

      // Compute summary statistics for all time ranges
      const weekRange = getDateRange('week');
      const monthRange = getDateRange('month');
      const quarterRange = getDateRange('quarter');

      const weekHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= weekRange.start && date <= weekRange.end;
        })
        .reduce((sum, s) => sum + (s.duration || 0), 0);

      const monthHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= monthRange.start && date <= monthRange.end;
        })
        .reduce((sum, s) => sum + (s.duration || 0), 0);

      const quarterHours = sessions
        .filter(s => {
          const date = new Date(s.start_time);
          return date >= quarterRange.start && date <= quarterRange.end;
        })
        .reduce((sum, s) => sum + (s.duration || 0), 0);

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
