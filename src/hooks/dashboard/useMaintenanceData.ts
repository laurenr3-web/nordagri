
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceEvent } from './types/dashboardTypes';

export const useMaintenanceData = (user: any) => {
  const { data: maintenanceEvents = [], isLoading: loading, error: queryError, refetch: refresh } = useQuery({
    queryKey: ['dashboard', 'maintenance', user?.id],
    queryFn: async (): Promise<MaintenanceEvent[]> => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map(item => {
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (item.priority) {
          const lp = item.priority.toLowerCase();
          if (lp === 'low' || lp === 'medium' || lp === 'high') priority = lp as any;
        }
        return {
          id: item.id,
          title: item.title,
          date: new Date(item.due_date),
          equipment: item.equipment,
          status: item.status,
          priority,
          assignedTo: item.assigned_to || 'Non assigné',
          duration: item.estimated_duration || 0,
        };
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { loading, maintenanceEvents, error: queryError?.message ?? null, refresh };
};

export default useMaintenanceData;
