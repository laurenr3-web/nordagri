
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardStats {
  activeEquipment: number;
  maintenanceTasks: {
    total: number;
    highPriority: number;
  };
  partsInventory: {
    total: number;
    lowStock: number;
  };
  fieldInterventions: number;
}

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeEquipment: 0,
    maintenanceTasks: { total: 0, highPriority: 0 },
    partsInventory: { total: 0, lowStock: 0 },
    fieldInterventions: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch active equipment count
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id')
          .eq('status', 'operational');

        if (equipmentError) throw equipmentError;

        // Fetch maintenance tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('maintenance_tasks')
          .select('id, priority')
          .neq('status', 'completed');

        if (tasksError) throw tasksError;

        // Fetch parts inventory
        const { data: partsData, error: partsError } = await supabase
          .from('parts_inventory')
          .select('id, quantity, reorder_threshold');

        if (partsError) throw partsError;

        // Fetch field interventions
        const { data: interventionsData, error: interventionsError } = await supabase
          .from('interventions')
          .select('id')
          .neq('status', 'completed');

        if (interventionsError) throw interventionsError;

        // Calculate stats
        const highPriorityTasks = tasksData?.filter(task => 
          task.priority === 'high' || task.priority === 'critical'
        ).length || 0;

        const lowStockParts = partsData?.filter(part => 
          part.quantity <= (part.reorder_threshold || 5)
        ).length || 0;

        setStats({
          activeEquipment: equipmentData?.length || 0,
          maintenanceTasks: {
            total: tasksData?.length || 0,
            highPriority: highPriorityTasks
          },
          partsInventory: {
            total: partsData?.length || 0,
            lowStock: lowStockParts
          },
          fieldInterventions: interventionsData?.length || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
