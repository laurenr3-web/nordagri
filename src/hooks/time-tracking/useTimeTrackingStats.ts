import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface WorkShiftRow {
  punch_in_at: string;
  punch_out_at: string | null;
}

export function useTimeTrackingStats(userId: string | null) {
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Source unique : work_shifts (même que le Calendrier d'activité et useMonthlySummary).
      // Garantit qu'aucune carte de stats ne diverge du calendrier et qu'on ne double
      // compte pas avec time_sessions.
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const { data, error } = await supabase
        .from('work_shifts')
        .select('punch_in_at, punch_out_at')
        .eq('user_id', userId)
        .gte('punch_in_at', monthStart.toISOString())
        .lte('punch_in_at', monthEnd.toISOString());

      if (error) throw error;

      const rows = (data as WorkShiftRow[] | null) ?? [];
      const nowMs = Date.now();

      let totalToday = 0;
      let totalWeek = 0;
      let totalMonth = 0;

      rows.forEach(shift => {
        const startDate = new Date(shift.punch_in_at);
        const endMs = shift.punch_out_at ? new Date(shift.punch_out_at).getTime() : nowMs;
        const hours = Math.max(0, (endMs - startDate.getTime()) / (1000 * 60 * 60));
        if (hours <= 0) return;

        totalMonth += hours;
        if (startDate >= weekStart && startDate <= weekEnd) {
          totalWeek += hours;
          if (format(startDate, 'yyyy-MM-dd') === todayString) {
            totalToday += hours;
          }
        }
      });

      // Mêmes garde-fous que useMonthlySummary / useDailyHours
      totalMonth = Math.min(totalMonth, 744);
      totalWeek = Math.min(totalWeek, 168);
      totalToday = Math.min(totalToday, 24);

      setStats({ totalToday, totalWeek, totalMonth });
    } catch (error) {
      console.error("Error calculating statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      calculateStats();
      
      // Actualiser les statistiques toutes les minutes pour les sessions actives
      const intervalId = setInterval(calculateStats, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [userId]);

  return { stats, isLoading, calculateStats };
}
