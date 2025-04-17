
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { withErrorHandling } from '@/utils/errorHandling';

export function usePayrollPeriod(userId: string | null, startDate: Date, endDate: Date, periodType?: string) {
  const [totalHours, setTotalHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const previousValueRef = useRef<number>(0);
  
  // Use this flag to prevent flickering during loading
  const isInitialLoadRef = useRef<boolean>(true);

  const fetchPayrollData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      if (isInitialLoadRef.current) {
        setIsLoading(true);
      }
      setError(null);
      
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
        setError(error);
        return;
      }

      // Calculate total hours from all sessions
      const total = data?.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0) || 0;
      
      // Only update the value if it has actually changed or is initial load
      if (Math.abs(previousValueRef.current - total) > 0.01 || isInitialLoadRef.current) {
        setTotalHours(total);
        previousValueRef.current = total;
      }
    } catch (error) {
      console.error('Error in usePayrollPeriod:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      // Don't reset totalHours to 0 on error to maintain last valid value
    } finally {
      setIsLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [userId, startDate, endDate, periodType]);

  // Memoize the refetch function to avoid recreating it on each render
  const refetch = useCallback(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  useEffect(() => {
    // Reset the initial load flag when dependencies change
    isInitialLoadRef.current = true;
    fetchPayrollData();
    
    // Set up an interval to refetch data every 5 minutes to keep it fresh
    const intervalId = setInterval(() => {
      fetchPayrollData();
    }, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchPayrollData]);

  return { totalHours, isLoading, error, refetch };
}
