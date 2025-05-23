
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimeBreakdownData {
  task_type: string;
  minutes: number;
  color: string;
}

const TASK_COLORS = {
  'maintenance': '#10B981', // Emerald
  'repair': '#67E8F9',     // Cyan
  'inspection': '#6EE7B7', // Green
  'operation': '#8B5CF6',  // Purple
  'traite': '#D946EF',     // Pink
  'other': '#6B7280'       // Gray
};

export function useTimeBreakdown() {
  const [data, setData] = useState<TimeBreakdownData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTimeBreakdown = async () => {
      try {
        const { data: timeData, error: timeError } = await supabase
          .from('time_sessions')
          .select(`
            task_types (
              name
            ),
            duration
          `)
          .eq('status', 'completed')
          .not('task_type_id', 'is', null)
          .not('duration', 'is', null);

        if (timeError) throw timeError;

        // Process the data for the chart
        const groupedData = timeData.reduce((acc, session) => {
          // Fixed: Access task name properly with type safety
          const taskType = session.task_types && typeof session.task_types === 'object' ? 
            (session.task_types as any).name || 'other' : 'other';
          const duration = typeof session.duration === 'number' ? session.duration : 0;
          
          if (!acc[taskType]) {
            acc[taskType] = 0;
          }
          acc[taskType] += duration * 60; // Convert hours to minutes
          return acc;
        }, {} as Record<string, number>);

        // Convert to array format needed for the chart with proper typing
        const chartData: TimeBreakdownData[] = Object.entries(groupedData).map(([task_type, minutes]) => ({
          task_type,
          minutes: Number(minutes), // Ensure minutes is a number
          color: TASK_COLORS[task_type as keyof typeof TASK_COLORS] || TASK_COLORS.other
        }));

        setData(chartData);
      } catch (err) {
        console.error('Error fetching time breakdown:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeBreakdown();
  }, []);

  return { data, isLoading, error };
}
