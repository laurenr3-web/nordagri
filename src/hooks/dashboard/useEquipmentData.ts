
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  nextMaintenance: string | null;
}

export const useEquipmentData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchEquipment();
    } else {
      setMockData();
    }
  }, [user]);

  const setMockData = () => {
    setEquipmentData([
      { id: 1, name: 'John Deere 8R 410', type: 'Tractor', status: 'operational', nextMaintenance: 'In 3 weeks' },
      { id: 2, name: 'Case IH Axial-Flow', type: 'Combine Harvester', status: 'maintenance', nextMaintenance: 'In 2 days' },
      { id: 3, name: 'Kubota M7-172', type: 'Tractor', status: 'repair', nextMaintenance: 'Overdue' }
    ]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // Recherche de la table correcte (equipment ou equipments)
      let tableToUse = 'equipment';
      
      // Test pour voir si la table 'equipment' existe
      const { error: testError } = await supabase
        .from('equipment')
        .select('id')
        .limit(1);
        
      // Si erreur, essayer avec 'equipments'
      if (testError) {
        tableToUse = 'equipments';
      }
      
      // Get equipment data
      const { data, error } = await supabase
        .from(tableToUse)
        .select('id, name, type, status')
        .eq('owner_id', user?.id)
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        // Get maintenance tasks for each equipment
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance_tasks')
          .select('equipment_id, title, due_date')
          .in('equipment_id', data.map(eq => eq.id.toString()))
          .eq('status', 'scheduled')
          .order('due_date', { ascending: true });

        if (maintenanceError) {
          console.error("Error fetching maintenance data:", maintenanceError);
        }

        // Create a map of equipment IDs to their next maintenance task
        const maintenanceMap = new Map();
        if (maintenanceData) {
          maintenanceData.forEach(task => {
            // Only add to map if this is the first (earliest) task for this equipment
            if (!maintenanceMap.has(task.equipment_id)) {
              maintenanceMap.set(task.equipment_id, formatDueDate(new Date(task.due_date)));
            }
          });
        }

        // Transform the data to match the EquipmentItem type
        const mappedEquipment: EquipmentItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'Unknown',
          status: item.status || 'operational',
          nextMaintenance: maintenanceMap.get(item.id.toString()) || null
        }));
        setEquipmentData(mappedEquipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format due date to a user-friendly string
  const formatDueDate = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays <= 30) {
      return `In ${Math.ceil(diffDays / 7)} weeks`;
    } else {
      return `In ${Math.ceil(diffDays / 30)} months`;
    }
  };

  return {
    loading,
    equipmentData,
    fetchEquipment
  };
};
