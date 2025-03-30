
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface UpcomingTask {
  id: number;
  title: string;
  equipment: string;
  date: Date;
  priority: string;
}

export const useTasksData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setMockData();
    }
  }, [user]);

  const setMockData = () => {
    setUpcomingTasks([
      {
        id: 1,
        title: 'Oil and Filter Change',
        equipment: 'John Deere 8R 410',
        date: new Date(),
        priority: 'high'
      },
      {
        id: 2,
        title: 'Hydraulic System Check',
        equipment: 'Case IH Axial-Flow',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      }
    ]);
    setLoading(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Using maintenance_tasks
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, equipment, due_date, priority')
        .eq('owner_id', user?.id)
        .eq('status', 'scheduled')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        const mappedTasks: UpcomingTask[] = data.map(task => ({
          id: task.id,
          title: task.title,
          equipment: task.equipment,
          date: new Date(task.due_date),
          priority: task.priority || 'medium'
        }));
        setUpcomingTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // If there's an error, set an empty array to avoid UI issues
      setUpcomingTasks([]);
      toast({
        title: "Error",
        description: "Failed to fetch tasks data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    upcomingTasks,
    fetchTasks
  };
};
