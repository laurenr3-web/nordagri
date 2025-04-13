
import { useState, useEffect } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import type { MaintenanceTask } from '@/services/supabase/maintenanceService';
import { toast } from 'sonner';
import { adaptServiceTaskToModelTask } from '@/hooks/maintenance/adapters/maintenanceTypeAdapters';

export const useMaintenanceTasks = (equipmentId: string | undefined) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!equipmentId) return;
      
      try {
        setLoading(true);
        const numericId = parseInt(equipmentId, 10);
        
        // Call the service to get maintenance tasks for this equipment
        const equipmentTasks = await maintenanceService.getTasksForEquipment(numericId);
        setTasks(equipmentTasks);
      } catch (err: any) {
        console.error('Error fetching maintenance tasks:', err);
        setError(err instanceof Error ? err : new Error(err.message));
        toast.error('Erreur lors du chargement des tâches de maintenance');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [equipmentId]);
  
  return {
    tasks,
    loading,
    error
  };
};
