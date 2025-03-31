
import { supabase } from '@/integrations/supabase/client';

/**
 * Récupère l'historique de maintenance d'un équipement
 */
export async function getEquipmentMaintenanceHistory(equipmentId: number) {
  try {
    const { data, error } = await supabase
      .from('equipment_maintenance_schedule')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching equipment maintenance history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getEquipmentMaintenanceHistory (${equipmentId}):`, error);
    throw error;
  }
}
