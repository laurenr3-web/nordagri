
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

export function usePayrollPeriod(userId: string | null, startDate: Date, endDate: Date) {
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('time_sessions')
          .select('duration')
          .eq('user_id', userId)
          .gte('start_time', startOfDay(startDate).toISOString())
          .lte('end_time', endOfDay(endDate).toISOString())
          .eq('status', 'completed');

        if (error) throw error;

        const total = data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
        setTotalHours(total);
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        setTotalHours(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollData();
  }, [userId, startDate, endDate]);

  return { totalHours, isLoading };
}
