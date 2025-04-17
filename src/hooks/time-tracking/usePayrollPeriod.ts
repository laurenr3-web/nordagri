
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function usePayrollPeriod(userId: string | null, startDate: Date, endDate: Date, periodType?: string) {
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        let query = supabase
          .from('time_sessions')
          .select('duration')
          .eq('user_id', userId)
          .eq('status', 'completed');

        // Apply date filters based on periodType
        if (periodType === 'today') {
          const today = new Date();
          query = query
            .gte('start_time', startOfDay(today).toISOString())
            .lte('start_time', endOfDay(today).toISOString());
        } else if (periodType === 'weekly') {
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
          query = query
            .gte('start_time', weekStart.toISOString())
            .lte('start_time', new Date().toISOString());
        } else if (periodType === 'biweekly') {
          query = query
            .gte('start_time', subDays(new Date(), 14).toISOString())
            .lte('start_time', new Date().toISOString());
        } else if (periodType === 'triweekly') {
          query = query
            .gte('start_time', subDays(new Date(), 21).toISOString())
            .lte('start_time', new Date().toISOString());
        } else if (periodType === 'monthly') {
          const monthStart = startOfMonth(new Date());
          query = query
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', new Date().toISOString());
        } else {
          // Default to custom date range
          query = query
            .gte('start_time', startOfDay(startDate).toISOString())
            .lte('start_time', endOfDay(endDate).toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching payroll data:', error);
          throw error;
        }

        // Calculate total hours from all sessions
        const total = data?.reduce((sum, session) => {
          return sum + (session.duration || 0);
        }, 0) || 0;
        
        setTotalHours(total);
      } catch (error) {
        console.error('Error in usePayrollPeriod:', error);
        setTotalHours(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollData();
  }, [userId, startDate, endDate, periodType]);

  return { totalHours, isLoading };
}
