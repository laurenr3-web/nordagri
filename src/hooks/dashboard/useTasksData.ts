
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingTask {
  id: string | number;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  priority: string;
  assignedTo: string;
}

export const useTasksData = (user: any) => {
  const { data: upcomingTasks = [], isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'tasks', user?.id],
    queryFn: async (): Promise<UpcomingTask[]> => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('status', 'scheduled')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.notes || 'Pas de description',
        dueDate: new Date(item.due_date),
        status: item.status,
        priority: item.priority,
        assignedTo: item.assigned_to || 'Non assigné',
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { loading, upcomingTasks };
};

export default useTasksData;
