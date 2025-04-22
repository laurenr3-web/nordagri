
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface EmployeeHoursData {
  userId: string;
  name: string;
  hours: number;
  color: string;
}

export function useEmployeeHours(month: Date) {
  const [data, setData] = useState<EmployeeHoursData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchEmployeeHours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);
        
        // Get all time entries for the month grouped by employee
        const { data: sessionData, error: sessionError } = await supabase
          .from('time_sessions')
          .select(`
            user_id,
            duration,
            start_time,
            end_time,
            profiles:user_id (
              first_name,
              last_name
            )
          `)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .not('end_time', 'is', null);
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData || sessionData.length === 0) {
          setData([]);
          return;
        }
        
        // Process the data to calculate hours per employee
        const employeeMap = new Map<string, { 
          name: string;
          hours: number;
        }>();
        
        sessionData.forEach(entry => {
          const userId = entry.user_id;
          const profiles = entry.profiles as any;
          const firstName = profiles?.first_name || 'Unknown';
          const lastName = profiles?.last_name || 'User';
          const name = `${firstName} ${lastName}`;
          
          // Calculate duration in hours
          let hours = 0;
          if (entry.duration) {
            hours = entry.duration;
          } else if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }
          
          const current = employeeMap.get(userId);
          if (current) {
            employeeMap.set(userId, {
              name,
              hours: current.hours + hours
            });
          } else {
            employeeMap.set(userId, { name, hours });
          }
        });
        
        // Convert to array and add colors
        const colors = [
          '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
          '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
        ];
        
        const result = Array.from(employeeMap.entries()).map(([userId, info], index) => ({
          userId,
          name: info.name,
          hours: parseFloat(info.hours.toFixed(2)),
          color: colors[index % colors.length]
        }));
        
        setData(result);
      } catch (e) {
        console.error('Error fetching employee hours:', e);
        setError(e instanceof Error ? e : new Error('Failed to load employee hours data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployeeHours();
  }, [month]);
  
  return { data, isLoading, error };
}
