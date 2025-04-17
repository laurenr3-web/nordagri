
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchDailyHours = async () => {
      try {
        setIsLoading(true);
        
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Get hours per day from time_sessions
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            start_time,
            end_time,
            duration
          `)
          .eq('user_id', userId)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time');
          
        if (error) throw error;
        
        // Aggregate hours by date
        const hoursByDate = new Map<string, number>();
        
        data?.forEach(session => {
          const date = format(new Date(session.start_time), 'yyyy-MM-dd');
          
          // Calculate duration if not available
          let sessionDuration = session.duration;
          if (!sessionDuration && session.end_time) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          // Only count if we have a valid duration
          if (sessionDuration) {
            const currentTotal = hoursByDate.get(date) || 0;
            hoursByDate.set(date, currentTotal + sessionDuration);
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
  }, [month]);
  
  return {
    dailyHours,
    isLoading,
    error
  };
}
