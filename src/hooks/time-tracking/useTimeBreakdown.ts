
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TaskTimeBreakdown {
  task_type: string;
  minutes: number;
  color: string;
}

// Define colors for different task types
const getColorForTaskType = (taskType: string): string => {
  const colorMap: Record<string, string> = {
    maintenance: '#4CAF50',
    repair: '#F44336',
    inspection: '#2196F3',
    installation: '#9C27B0',
    default: '#757575'
  };
  
  return colorMap[taskType.toLowerCase()] || colorMap.default;
};

export function useTimeBreakdown() {
  const [data, setData] = useState<TaskTimeBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTimeBreakdown = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("User not authenticated");
        }
        
        // Fetch completed interventions with task type
        const { data: interventions, error: interventionsError } = await supabase
          .from('interventions')
          .select(`
            duration,
            task_type_id,
            task_types:task_types(name)
          `)
          .eq('owner_id', userData.user.id)
          .eq('status', 'completed')
          .not('duration', 'is', null);
        
        if (interventionsError) throw interventionsError;
        
        // Process the data for chart display
        const taskTypeMap = new Map<string, number>();
        
        interventions?.forEach(intervention => {
          // Get task type name from the task_types join
          const taskTypeName = intervention.task_types?.name || 'Other';
          
          // Convert hours to minutes and add to the map
          const minutes = (intervention.duration || 0) * 60;
          const current = taskTypeMap.get(taskTypeName) || 0;
          taskTypeMap.set(taskTypeName, current + minutes);
        });
        
        // Convert to chart format with colors
        const chartData = Array.from(taskTypeMap.entries()).map(([task_type, minutes]) => ({
          task_type,
          minutes,
          color: getColorForTaskType(task_type)
        }));
        
        // Sort by time descending
        chartData.sort((a, b) => b.minutes - a.minutes);
        
        setData(chartData);
      } catch (err) {
        console.error("Error fetching time breakdown:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeBreakdown();
  }, []);
  
  return { data, isLoading, error };
}
