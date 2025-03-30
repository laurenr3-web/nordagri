import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { ensureNumberId, validateEquipmentStatus } from '@/utils/typeGuards';

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  image?: string;
  usage?: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: string;
  };
  nextMaintenance?: string | null; // Keep for backward compatibility
}

// Define a type for raw equipment data from database
interface RawEquipmentData {
  id: number;
  name?: string;
  type?: string;
  status?: string;
  image?: string;
  usage_hours?: number;
  usage_target?: number;
  model?: string;
}

// Define a type for maintenance task data
interface MaintenanceTask {
  equipment_id: string;
  title: string;
  due_date: string;
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
      {
        id: 1,
        name: 'John Deere 8R 410',
        type: 'Tractor',
        image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
        status: 'operational',
        usage: {
          hours: 342,
          target: 500
        },
        nextService: {
          type: 'Filter Change',
          due: 'In 3 weeks'
        },
        nextMaintenance: 'In 3 weeks'
      },
      {
        id: 2,
        name: 'Case IH Axial-Flow',
        type: 'Combine Harvester',
        image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
        status: 'maintenance',
        usage: {
          hours: 480,
          target: 500
        },
        nextService: {
          type: 'Full Service',
          due: 'In 2 days'
        },
        nextMaintenance: 'In 2 days'
      },
      {
        id: 3,
        name: 'Kubota M7-172',
        type: 'Tractor',
        image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
        status: 'repair',
        usage: {
          hours: 620,
          target: 500
        },
        nextService: {
          type: 'Engine Check',
          due: 'Overdue'
        },
        nextMaintenance: 'Overdue'
      }
    ]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // Try equipments table first
      const { data: equipmentsData, error: equipmentsError } = await supabase
        .from('equipments')
        .select('id, name, type, status, image, usage_hours, usage_target, model')
        .eq('owner_id', user?.id)
        .limit(6);

      if (equipmentsError) {
        console.log("Error with 'equipments', trying 'equipment':", equipmentsError);
        
        // If that fails, try equipment table
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, type, status, image, usage_hours, usage_target, model')
          .eq('owner_id', user?.id)
          .limit(6);

        if (equipmentError) {
          throw new Error("Unable to access equipments or equipment tables");
        }

        // Use equipment data if available
        if (equipmentData && equipmentData.length > 0) {
          await processEquipmentData(equipmentData as unknown as RawEquipmentData[]);
        } else {
          setEquipmentData([]);
        }
      } else {
        // Use equipments data if available
        if (equipmentsData && equipmentsData.length > 0) {
          await processEquipmentData(equipmentsData as unknown as RawEquipmentData[]);
        } else {
          setEquipmentData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment data. Using sample data for demonstration.",
        variant: "destructive",
      });
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Process equipment data and fetch associated maintenance tasks
  const processEquipmentData = async (equipmentItems: RawEquipmentData[]) => {
    try {
      // Get equipment IDs as numbers for the query
      const equipmentIds = equipmentItems.map(eq => eq.id);
      
      // Convert IDs to strings for the Supabase query
      const equipmentIdStrings = equipmentIds.map(id => id.toString());
      
      // Get scheduled maintenance tasks for these equipment
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('equipment_id, title, due_date')
        .in('equipment_id', equipmentIds)
        .eq('status', 'scheduled')
        .order('due_date', { ascending: true });

      // Create a map of equipment to their next maintenance tasks
      const maintenanceMap = new Map<string, { type: string; due: string }>();
      const simpleDueMap = new Map<string, string>();
      
      if (maintenanceData && !maintenanceError) {
        (maintenanceData as unknown as MaintenanceTask[]).forEach(task => {
          if (!maintenanceMap.has(task.equipment_id)) {
            const formattedDue = formatDueDate(new Date(task.due_date));
            maintenanceMap.set(task.equipment_id, {
              type: task.title,
              due: formattedDue
            });
            simpleDueMap.set(task.equipment_id, formattedDue);
          }
        });
      }

      // Transform equipment data to our interface format
      const mappedEquipment: EquipmentItem[] = equipmentItems.map(item => {
        // Default image based on equipment type
        let defaultImage = 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop';
        if (item.type?.toLowerCase().includes('combine') || item.type?.toLowerCase().includes('harvester')) {
          defaultImage = 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop';
        }

        const itemId = item.id.toString();
        
        return {
          id: item.id,
          name: item.name || `${item.model || 'Unknown'} Equipment`,
          type: item.type || 'Unknown',
          status: validateEquipmentStatus(item.status),
          image: item.image || defaultImage,
          usage: {
            hours: item.usage_hours || 0,
            target: item.usage_target || 500
          },
          nextService: maintenanceMap.get(itemId) || {
            type: 'Regular Maintenance',
            due: 'Not scheduled'
          },
          nextMaintenance: simpleDueMap.get(itemId) || null
        };
      });
      
      setEquipmentData(mappedEquipment);
    } catch (error) {
      console.error("Error processing equipment data:", error);
      // In case of error, at least set basic equipment data
      const simpleEquipment: EquipmentItem[] = equipmentItems.map(item => ({
        id: item.id,
        name: item.name || `Equipment #${item.id}`,
        type: item.type || 'Unknown',
        status: validateEquipmentStatus(item.status),
        image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
      }));
      
      setEquipmentData(simpleEquipment);
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
