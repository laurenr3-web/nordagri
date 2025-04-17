
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TaskTypeDistribution {
  type: string;
  hours: number;
  color?: string;
}

// Colors for different task types
const TASK_TYPE_COLORS: Record<string, string> = {
  'maintenance': '#8884d8',
  'repair': '#82ca9d',
  'inspection': '#ffc658',
  'operation': '#ff8042',
  'traite': '#D946EF',  // Ajout d'une couleur pour "traite"
  'entretien': '#0088FE', // Ajout d'une couleur pour "entretien"
  'mécanique': '#00C49F', // Ajout d'une couleur pour "mécanique"
  'other': '#999999'
};

export function useTaskTypeDistribution(month: Date) {
  const [distribution, setDistribution] = useState<TaskTypeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setIsLoading(true);
        
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // First, get all task types for mapping
        const { data: taskTypes } = await supabase
          .from('task_types')
          .select('id, name');
          
        // Create a map for task type names by ID
        const taskTypeMap = new Map();
        taskTypes?.forEach(type => {
          taskTypeMap.set(type.id, type.name);
        });
        
        // Get all sessions with either task_type_id or custom_task_type
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            task_type_id,
            custom_task_type,
            duration,
            start_time,
            end_time
          `)
          .eq('user_id', userId)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString());
          
        if (error) throw error;
        
        // Aggregate hours by task type
        const hoursByType = new Map<string, number>();
        
        data?.forEach(session => {
          // Determine task type name - priority to task_type_id if present
          let taskType: string;
          
          if (session.task_type_id && taskTypeMap.has(session.task_type_id)) {
            taskType = taskTypeMap.get(session.task_type_id);
          } else if (session.custom_task_type) {
            taskType = session.custom_task_type;
          } else {
            taskType = 'Non spécifié';
          }
          
          // Calculate duration if not available
          let sessionDuration = session.duration;
          if (!sessionDuration && session.end_time) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          if (sessionDuration) {
            const currentTotal = hoursByType.get(taskType) || 0;
            hoursByType.set(taskType, currentTotal + sessionDuration);
          }
        });
        
        // Convert map to array and add colors
        const result: TaskTypeDistribution[] = Array.from(hoursByType.entries())
          .map(([type, hours]) => {
            // Normalize type for color lookup (lowercase)
            const normalizedType = type.toLowerCase();
            return {
              type,
              hours,
              color: TASK_TYPE_COLORS[normalizedType] || TASK_TYPE_COLORS.other
            };
          })
          .sort((a, b) => b.hours - a.hours); // Sort by hours descending
        
        setDistribution(result);
      } catch (err) {
        console.error('Error fetching task type distribution:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDistribution();
  }, [month]);
  
  return {
    distribution,
    isLoading,
    error
  };
}
