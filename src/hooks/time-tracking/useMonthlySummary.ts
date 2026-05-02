import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TimeSummary {
  today: number;
  week: number;
  month: number;
  todayPercentage: number;
  weekPercentage: number;
  monthPercentage: number;
}

interface WorkShiftRow {
  punch_in_at: string;
  punch_out_at: string | null;
}

export function useMonthlySummary() {
  const [summary, setSummary] = useState<TimeSummary>({
    today: 0,
    week: 0,
    month: 0,
    todayPercentage: 0,
    weekPercentage: 0,
    monthPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isActive = true;
    
    const fetchSummary = async () => {
      if (!isActive) return;
      
      try {
        setIsLoading(true);
        
        // Source unique : work_shifts (même que le Calendrier d'activité, useDailyHours).
        // Évite tout écart et tout double comptage avec time_sessions.
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const todayDateStr = format(today, 'yyyy-MM-dd');

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;

        const userId = sessionData.session.user.id;

        const { data, error } = await supabase
          .from('work_shifts')
          .select('punch_in_at, punch_out_at')
          .eq('user_id', userId)
          .gte('punch_in_at', monthStart.toISOString())
          .lte('punch_in_at', monthEnd.toISOString());

        if (error) throw error;

        const rows = (data as WorkShiftRow[] | null) ?? [];
        const nowMs = Date.now();

        let todayHours = 0;
        let weekHours = 0;
        let monthHours = 0;

        // Heures de travail standards pour le calcul des pourcentages
        const standardDayHours = 8;
        const standardWeekHours = 40;
        const standardMonthHours = 160;

        rows.forEach(shift => {
          const startDate = new Date(shift.punch_in_at);
          const endMs = shift.punch_out_at ? new Date(shift.punch_out_at).getTime() : nowMs;
          const hours = Math.max(0, (endMs - startDate.getTime()) / (1000 * 60 * 60));
          if (hours <= 0) return;

          monthHours += hours;
          if (startDate >= weekStart && startDate <= weekEnd) {
            weekHours += hours;
            if (format(startDate, 'yyyy-MM-dd') === todayDateStr) {
              todayHours += hours;
            }
          }
        });

        // Garde-fous identiques à useDailyHours/useTimeTrackingStats
        monthHours = Math.min(monthHours, 744);
        weekHours = Math.min(weekHours, 168);
        todayHours = Math.min(todayHours, 24);
        
        // Calculer les pourcentages
        const todayPercentage = Math.min((todayHours / standardDayHours) * 100, 100);
        const weekPercentage = Math.min((weekHours / standardWeekHours) * 100, 100);
        const monthPercentage = Math.min((monthHours / standardMonthHours) * 100, 100);
        
        if (isActive) {
          setSummary({
            today: todayHours,
            week: weekHours,
            month: monthHours,
            todayPercentage,
            weekPercentage,
            monthPercentage
          });
        }
      } catch (err) {
        console.error('Error fetching time summary:', err);
        if (isActive) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    
    fetchSummary();

    // Refresh chaque minute pour faire monter le total d'une journée active.
    // Même cadence que useDailyHours pour rester aligné avec le calendrier.
    intervalId = setInterval(fetchSummary, 60_000);
    
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);
  
  return {
    summary,
    isLoading,
    error
  };
}
