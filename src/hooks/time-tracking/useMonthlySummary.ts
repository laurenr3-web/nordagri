
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
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Get all time entries for the current month
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            id,
            start_time,
            end_time,
            duration,
            status
          `)
          .eq('user_id', userId)
          .gte('start_time', monthStart.toISOString())
          .lte('start_time', monthEnd.toISOString());
          
        if (error) throw error;
        
        let todayHours = 0;
        let weekHours = 0;
        let monthHours = 0;
        
        // Set standard work hours for percentage calculation
        const standardDayHours = 8; // 8 hours per day
        const standardWeekHours = 40; // 40 hours per week
        const standardMonthHours = 160; // ~160 hours per month
        
        // Calculate hours for each period
        data?.forEach(session => {
          const startTime = new Date(session.start_time);
          
          // Calculate duration if not available
          let sessionDuration = session.duration;
          if (!sessionDuration && session.end_time) {
            const endTime = new Date(session.end_time);
            sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          } else if (!sessionDuration && session.status === 'active') {
            // For active sessions without duration, calculate from start to now
            sessionDuration = (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          if (sessionDuration) {
            // Add to monthly total
            monthHours += sessionDuration;
            
            // Check if in current week
            if (startTime >= weekStart && startTime <= weekEnd) {
              weekHours += sessionDuration;
            }
            
            // Check if today
            const sessionDate = format(startTime, 'yyyy-MM-dd');
            const todayDate = format(today, 'yyyy-MM-dd');
            if (sessionDate === todayDate) {
              todayHours += sessionDuration;
            }
          }
        });
        
        // Calculate percentages
        const todayPercentage = Math.min((todayHours / standardDayHours) * 100, 100);
        const weekPercentage = Math.min((weekHours / standardWeekHours) * 100, 100);
        const monthPercentage = Math.min((monthHours / standardMonthHours) * 100, 100);
        
        setSummary({
          today: todayHours,
          week: weekHours,
          month: monthHours,
          todayPercentage,
          weekPercentage,
          monthPercentage
        });
      } catch (err) {
        console.error('Error fetching time summary:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummary();
    
    // Set an interval to refresh the data every minute (important for active sessions)
    const intervalId = setInterval(fetchSummary, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return {
    summary,
    isLoading,
    error
  };
}
