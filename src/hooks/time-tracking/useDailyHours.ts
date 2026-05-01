
import { useState, useEffect, useMemo } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface DailyHours {
  date: string;
  hours: number;
}

interface WorkShiftRow {
  punch_in_at: string;
  punch_out_at: string | null;
}

export function useDailyHours(month: Date) {
  const [dailyHours, setDailyHours] = useState<DailyHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize date range calculations to prevent unnecessary effects
  const dateRange = useMemo(() => {
    return {
      startDate: startOfMonth(month),
      endDate: endOfMonth(month)
    };
  }, [month]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchDailyHours = async () => {
      try {
        setIsLoading(true);

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;

        const userId = sessionData.session.user.id;

        // Source: work_shifts (Punch In / Punch Out). Avoids double-counting with time_sessions.
        const { data, error } = await supabase
          .from('work_shifts')
          .select('punch_in_at, punch_out_at')
          .eq('user_id', userId)
          .gte('punch_in_at', dateRange.startDate.toISOString())
          .lte('punch_in_at', dateRange.endDate.toISOString())
          .order('punch_in_at');

        if (error) throw error;

        const rows = (data as WorkShiftRow[] | null) ?? [];

        // Aggregate hours by local date (not UTC date). Active shifts use now() as end.
        const hoursByDate = new Map<string, number>();
        const nowMs = Date.now();

        rows.forEach(shift => {
          const startDate = new Date(shift.punch_in_at);
          const dateKey = format(startDate, 'yyyy-MM-dd');
          const endMs = shift.punch_out_at ? new Date(shift.punch_out_at).getTime() : nowMs;
          const startMs = startDate.getTime();
          const hours = Math.max(0, (endMs - startMs) / (1000 * 60 * 60));
          if (hours > 0) {
            hoursByDate.set(dateKey, (hoursByDate.get(dateKey) ?? 0) + hours);
          }
        });

        const result: DailyHours[] = Array.from(hoursByDate.entries()).map(([date, hours]) => ({
          date,
          hours
        }));

        setDailyHours(result);
      } catch (err) {
        console.error('Error fetching daily hours:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyHours();

    // Refresh every 60s so an active shift's running total updates in the calendar.
    intervalId = setInterval(fetchDailyHours, 60_000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dateRange.startDate, dateRange.endDate]);
  
  return {
    dailyHours,
    isLoading,
    error
  };
}
