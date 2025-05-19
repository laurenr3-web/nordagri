
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TaskDetail {
  id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  task_type: string;
  equipment_name?: string;
  notes?: string;
}

export function useTaskDetails(date: Date) {
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setIsLoading(true);
        
        // Format date to YYYY-MM-DD
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Create start and end timestamps for the local day
        // This ensures we get sessions that started on this calendar day in local time
        const startOfDay = new Date(`${dateStr}T00:00:00`);
        const endOfDay = new Date(`${dateStr}T23:59:59`);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Use a query that gets all sessions that started on this local date
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            id,
            start_time,
            end_time,
            duration,
            custom_task_type,
            equipment_id,
            equipment:equipment_id (name),
            notes
          `)
          .eq('user_id', userId)
          .gte('start_time', startOfDay.toISOString())
          .lt('start_time', endOfDay.toISOString())
          .order('start_time');
          
        if (error) throw error;
        
        let totalHrs = 0;
        
        const processedTasks = (data || []).map(task => {
          let taskDuration = task.duration;
          
          // Calculate duration if not available
          if (!taskDuration && task.end_time) {
            const startTime = new Date(task.start_time);
            const endTime = new Date(task.end_time);
            taskDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          if (taskDuration) {
            totalHrs += taskDuration;
          }
          
          return {
            id: task.id,
            start_time: task.start_time,
            end_time: task.end_time,
            duration: taskDuration || 0,
            task_type: task.custom_task_type || 'Non spécifié',
            // Fix: Access equipment name safely
            equipment_name: task.equipment?.name,
            notes: task.notes
          };
        });
        
        setTasks(processedTasks);
        setTotalHours(totalHrs);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [date]);
  
  return {
    tasks,
    totalHours,
    isLoading,
    error
  };
}
