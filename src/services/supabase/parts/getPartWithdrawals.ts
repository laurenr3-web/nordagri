
import { supabase } from '@/integrations/supabase/client';
import { PartWithdrawal } from '@/types/PartWithdrawal';

/**
 * Get all part withdrawals with additional metadata (part name, equipment name, user name)
 */
export async function getPartWithdrawals(): Promise<PartWithdrawal[]> {
  try {
    console.log('Fetching all part withdrawals');
    
    const { data, error } = await supabase
      .from('part_withdrawals')
      .select(`
        *,
        parts_inventory(name),
        equipment(name),
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching part withdrawals:', error.message);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.log('No withdrawal data found or invalid data format');
      return [];
    }

    // Map the results to our PartWithdrawal type
    const withdrawals: PartWithdrawal[] = data.map(item => {
      // Safely access nested properties with correct types
      const partName = item.parts_inventory ? 
        typeof item.parts_inventory === 'object' && 'name' in item.parts_inventory ? 
          item.parts_inventory.name : undefined
        : undefined;
      
      const equipmentName = item.equipment ? 
        typeof item.equipment === 'object' && 'name' in item.equipment ? 
          item.equipment.name : undefined
        : undefined;
      
      let userName = undefined;
      if (item.profiles) {
        if (typeof item.profiles === 'object') {
          // Check if profiles is a direct object with first_name/last_name
          if ('first_name' in item.profiles || 'last_name' in item.profiles) {
            const profilesData = item.profiles as { first_name?: string; last_name?: string };
            const firstName = profilesData.first_name || '';
            const lastName = profilesData.last_name || '';
            userName = `${firstName} ${lastName}`.trim() || undefined;
          }
        }
      }

      return {
        id: item.id,
        part_id: item.part_id,
        quantity: item.quantity,
        withdrawn_by: item.withdrawn_by,
        withdrawn_at: item.withdrawn_at,
        equipment_id: item.equipment_id,
        task_id: item.task_id,
        notes: item.notes,
        farm_id: item.farm_id,
        created_at: item.created_at,
        part_name: partName,
        equipment_name: equipmentName,
        user_name: userName
      };
    });

    return withdrawals;
  } catch (error: any) {
    console.error('Error in getPartWithdrawals:', error.message);
    return [];
  }
}

/**
 * Get withdrawals for a specific part
 */
export async function getWithdrawalsForPart(partId: number): Promise<PartWithdrawal[]> {
  try {
    console.log(`Fetching withdrawals for part ID: ${partId}`);
    
    const { data, error } = await supabase
      .from('part_withdrawals')
      .select(`
        *,
        parts_inventory(name),
        equipment(name),
        profiles(first_name, last_name)
      `)
      .eq('part_id', partId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawals for part:', error.message);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.log('No withdrawal data found for part');
      return [];
    }

    // Map the results to our PartWithdrawal type
    const withdrawals: PartWithdrawal[] = data.map(item => {
      // Safely access nested properties with correct types
      const partName = item.parts_inventory ? 
        typeof item.parts_inventory === 'object' && 'name' in item.parts_inventory ? 
          item.parts_inventory.name : undefined
        : undefined;
      
      const equipmentName = item.equipment ? 
        typeof item.equipment === 'object' && 'name' in item.equipment ? 
          item.equipment.name : undefined
        : undefined;
      
      let userName = undefined;
      if (item.profiles) {
        if (typeof item.profiles === 'object') {
          // Check if profiles is a direct object with first_name/last_name
          if ('first_name' in item.profiles || 'last_name' in item.profiles) {
            const profilesData = item.profiles as { first_name?: string; last_name?: string };
            const firstName = profilesData.first_name || '';
            const lastName = profilesData.last_name || '';
            userName = `${firstName} ${lastName}`.trim() || undefined;
          }
        }
      }

      return {
        id: item.id,
        part_id: item.part_id,
        quantity: item.quantity,
        withdrawn_by: item.withdrawn_by,
        withdrawn_at: item.withdrawn_at,
        equipment_id: item.equipment_id,
        task_id: item.task_id,
        notes: item.notes,
        farm_id: item.farm_id,
        created_at: item.created_at,
        part_name: partName,
        equipment_name: equipmentName,
        user_name: userName
      };
    });

    return withdrawals;
  } catch (error: any) {
    console.error(`Error in getWithdrawalsForPart(${partId}):`, error.message);
    return [];
  }
}
