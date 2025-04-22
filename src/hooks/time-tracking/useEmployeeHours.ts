
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface EmployeeHoursData {
  name: string;
  hours: number;
  color: string;
}

// Helper function to generate colors for the chart
const getRandomColor = (index: number) => {
  const colors = [
    '#2563EB', // blue
    '#16A34A', // green
    '#D97706', // amber
    '#DC2626', // red
    '#7C3AED', // purple
    '#059669', // emerald
    '#DB2777', // pink
    '#2563EB', // blue
    '#9D174D', // rose
    '#4B5563', // gray
  ];
  return colors[index % colors.length];
};

export function useEmployeeHours(month: Date) {
  const [data, setData] = useState<EmployeeHoursData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmployeeHours = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;
        
        // Get the farm_id of the current user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (!profileData?.farm_id) return;

        // Fetch employee hours for the current farm
        const { data: hours, error: hoursError } = await supabase
          .from('time_sessions')
          .select(`
            duration,
            user_id,
            profiles:user_id (
              id, 
              first_name, 
              last_name
            )
          `)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .eq('status', 'completed')
          .filter('profiles.farm_id', 'eq', profileData.farm_id);
        
        if (hoursError) throw hoursError;

        // Calculate total hours per employee
        const employeeHoursMap: { [key: string]: { name: string, hours: number } } = {};
        
        hours?.forEach(session => {
          if (!session.duration || !session.profiles) return;
          
          const userId = session.user_id;
          const firstName = session.profiles.first_name || '';
          const lastName = session.profiles.last_name || '';
          const name = `${firstName} ${lastName}`.trim() || 'Utilisateur inconnu';
          
          if (!employeeHoursMap[userId]) {
            employeeHoursMap[userId] = { name, hours: 0 };
          }
          
          employeeHoursMap[userId].hours += session.duration;
        });
        
        // Convert to array and sort by hours (descending)
        const formattedData = Object.values(employeeHoursMap)
          .map((employee, index) => ({
            ...employee,
            hours: parseFloat(employee.hours.toFixed(1)),
            color: getRandomColor(index)
          }))
          .sort((a, b) => b.hours - a.hours);
        
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching employee hours:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployeeHours();
  }, [month]);

  return { data, isLoading, error };
}
