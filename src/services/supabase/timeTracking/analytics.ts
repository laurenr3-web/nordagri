
import { supabase } from '@/integrations/supabase/client';
import { TimeSpentByEquipment } from '@/hooks/time-tracking/types';

export async function getTimeSpentByEquipment(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimeSpentByEquipment[]> {
  try {
    let query = supabase
      .from('interventions')
      .select(`
        equipment_id,
        equipment,
        duration
      `)
      .eq('owner_id', userId)
      .not('duration', 'is', null);
    
    if (startDate) query = query.gte('date', startDate.toISOString());
    if (endDate) query = query.lte('date', endDate.toISOString());
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const equipmentMap = new Map<number, { name: string, minutes: number }>();
    
    data?.forEach(item => {
      if (item.equipment_id && item.duration) {
        const id = item.equipment_id;
        const current = equipmentMap.get(id) || { name: item.equipment || 'Unknown', minutes: 0 };
        current.minutes += item.duration * 60; // Convert hours to minutes
        equipmentMap.set(id, current);
      }
    });
    
    return Array.from(equipmentMap.entries()).map(([equipment_id, data]) => ({
      equipment_id,
      equipment_name: data.name,
      total_minutes: data.minutes
    }));
  } catch (error) {
    console.error("Error getting time spent by equipment:", error);
    throw error;
  }
}
