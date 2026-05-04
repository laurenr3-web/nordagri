
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TaskTypeDistribution {
  type: string;
  hours: number;
  color?: string;
  percentage?: number; // Make percentage optional to be compatible with both interfaces
}

// Colors for different task types
const TASK_TYPE_COLORS: Record<string, string> = {
  'maintenance': '#8884d8',
  'repair': '#82ca9d',
  'inspection': '#ffc658',
  'operation': '#ff8042',
  'other': '#0088FE'
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

        // Resolve all farm member user_ids so distribution covers the whole farm.
        const memberIds = new Set<string>([userId]);
        const { data: profile } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', userId)
          .maybeSingle();
        if (profile?.farm_id) {
          const { data: ownerRow } = await supabase
            .from('farms').select('owner_id').eq('id', profile.farm_id).maybeSingle();
          if (ownerRow?.owner_id) memberIds.add(ownerRow.owner_id);
          const { data: members } = await supabase
            .from('farm_members').select('user_id').eq('farm_id', profile.farm_id);
          members?.forEach((m: any) => m.user_id && memberIds.add(m.user_id));
        }

        // First, get all task types
        const { data: taskTypes } = await supabase
          .from('task_types')
          .select('id, name');
          
        // Create a map for task type names
        const taskTypeMap = new Map();
        taskTypes?.forEach(type => {
          taskTypeMap.set(type.id, type.name);
        });
        
        // Get time entries with duration for every member of the farm.
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            task_type_id,
            custom_task_type,
            duration,
            start_time,
            end_time
          `)
          .in('user_id', Array.from(memberIds))
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .not('end_time', 'is', null);
          
        if (error) throw error;
        
        // Aggregate hours by task type or custom type
        const hoursByType = new Map<string, number>();
        
        data?.forEach(session => {
          let taskType: string;
          
          // Use custom task type if available, otherwise use predefined task type
          if (session.custom_task_type) {
            taskType = session.custom_task_type;
          } else if (session.task_type_id && taskTypeMap.has(session.task_type_id)) {
            taskType = taskTypeMap.get(session.task_type_id);
          } else {
            taskType = 'Non spécifié';
          }
          
          // Calculate duration
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
        
        // Convert map to array and assign colors
        const result: TaskTypeDistribution[] = Array.from(hoursByType.entries())
          .map(([type, hours]) => {
            // Try to find a predefined color, otherwise use a default color
            const color = TASK_TYPE_COLORS[type.toLowerCase()] || '#999999';
            return { type, hours, color };
          })
          .sort((a, b) => b.hours - a.hours);
        
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
