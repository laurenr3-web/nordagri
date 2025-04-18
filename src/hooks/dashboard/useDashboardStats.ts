
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Initialize stats with default values
        const defaultStats: DashboardStats = {
          activeEquipment: 0,
          maintenanceTasks: { total: 0, highPriority: 0 },
          partsInventory: { total: 0, lowStock: 0 },
          fieldInterventions: 0
        };

        // Try to fetch active equipment count
        try {
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('id')
            .eq('status', 'operational');

          if (!equipmentError && equipmentData) {
            defaultStats.activeEquipment = equipmentData.length;
          }
        } catch (equipmentError) {
          console.error("Error fetching equipment data:", equipmentError);
        }

        // Try to fetch maintenance tasks
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from('maintenance_tasks')
            .select('id, priority')
            .neq('status', 'completed');

          if (!tasksError && tasksData) {
            defaultStats.maintenanceTasks.total = tasksData.length;
            defaultStats.maintenanceTasks.highPriority = tasksData.filter(task => 
              task.priority === 'high' || task.priority === 'critical'
            ).length || 0;
          }
        } catch (tasksError) {
          console.error("Error fetching maintenance tasks:", tasksError);
        }

        // Try to fetch parts inventory
        try {
          const { data: partsData, error: partsError } = await supabase
            .from('parts_inventory')
            .select('id, quantity, reorder_threshold');

          if (!partsError && partsData) {
            defaultStats.partsInventory.total = partsData.length;
            defaultStats.partsInventory.lowStock = partsData.filter(part => 
              part.quantity <= (part.reorder_threshold || 5)
            ).length || 0;
          }
        } catch (partsError) {
          console.error("Error fetching parts inventory:", partsError);
        }

        // Try to fetch field interventions
        try {
          const { data: interventionsData, error: interventionsError } = await supabase
            .from('interventions')
            .select('id')
            .neq('status', 'completed');

          if (!interventionsError && interventionsData) {
            defaultStats.fieldInterventions = interventionsData.length;
          }
        } catch (interventionsError) {
          console.error("Error fetching interventions:", interventionsError);
        }

        // Set the stats with whatever data we successfully retrieved
        setStats(defaultStats);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
