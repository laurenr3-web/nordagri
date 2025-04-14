
import { supabase } from '@/integrations/supabase/client';
import { EquipmentItem, RawEquipmentData, MaintenanceTask } from '../types/equipmentTypes';
import { transformEquipmentData, formatDueDate } from '../utils/equipmentUtils';
import { validateEquipmentStatus } from '@/utils/typeGuards';
import { toast } from "@/hooks/use-toast";

/**
 * Fetch equipment data from Supabase
 */
export const fetchEquipmentData = async (userId: string): Promise<EquipmentItem[]> => {
  try {
    // Query the equipment table directly (not equipments)
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('id, name, type, status, image, usage_hours, usage_target, model')
      .eq('owner_id', userId)
      .limit(6);

    if (equipmentError) {
      console.error("Error fetching equipment data:", equipmentError);
      throw equipmentError;
    }
      
    // Use equipment data if available
    if (equipmentData && equipmentData.length > 0) {
      return await processEquipmentWithMaintenance(equipmentData as unknown as RawEquipmentData[]);
    } else {
      console.log("No equipment data found");
      return [];
    }
  } catch (error) {
    console.error("Error in fetchEquipmentData:", error);
    throw error;
  }
};

/**
 * Process equipment data and fetch associated maintenance tasks
 */
const processEquipmentWithMaintenance = async (equipmentItems: RawEquipmentData[]): Promise<EquipmentItem[]> => {
  try {
    // Get equipment IDs as numbers
    const equipmentIds = equipmentItems.map(eq => eq.id);
    
    // Get scheduled maintenance tasks for these equipment
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance_tasks')
      .select('equipment_id, title, due_date')
      .in('equipment_id', equipmentIds)
      .eq('status', 'scheduled')
      .order('due_date', { ascending: true });

    // Create maps for maintenance data
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
    return transformEquipmentData(equipmentItems, maintenanceMap, simpleDueMap);
  } catch (error) {
    console.error("Error processing equipment data:", error);
    
    // In case of error, return basic equipment data
    const simpleEquipment: EquipmentItem[] = equipmentItems.map(item => ({
      id: item.id,
      name: item.name || `Equipment #${item.id}`,
      type: item.type || 'Unknown',
      status: validateEquipmentStatus(item.status),
      image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
    }));
    
    return simpleEquipment;
  }
};
