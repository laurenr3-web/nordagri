
import { useState, useEffect, useMemo } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface DailyHours {
  date: string;
  hours: number;
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
    const fetchDailyHours = async () => {
      try {
        setIsLoading(true);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Use a more precise date handling approach
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            start_time,
            end_time,
            duration
          `)
          .eq('user_id', userId)
          .gte('start_time', dateRange.startDate.toISOString())
          .lte('start_time', dateRange.endDate.toISOString())
          .order('start_time');
          
        if (error) throw error;
        
        // Aggregate hours by local date (not UTC date)
        const hoursByDate = new Map<string, number>();
        
        data?.forEach(session => {
          // Convert UTC date to local date format YYYY-MM-DD
          const localDate = new Date(session.start_time);
          const dateKey = format(localDate, 'yyyy-MM-dd');
          
          // Calculate duration if not available
          let sessionDuration = session.duration;
          if (!sessionDuration && session.end_time) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          // Only count if we have a valid duration
          if (sessionDuration) {
            const currentTotal = hoursByDate.get(dateKey) || 0;
            hoursByDate.set(dateKey, currentTotal + sessionDuration);
          }
        });
        
        // Convert map to array
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
  }, [dateRange.startDate, dateRange.endDate]);
  
  return {
    dailyHours,
    isLoading,
    error
  };
}
