
import { supabase } from '@/integrations/supabase/client';
import { PartWithdrawal } from '@/types/PartWithdrawal';

/**
 * Get all part withdrawals with additional metadata (part name, equipment name, user name)
 */
export async function getPartWithdrawals(): Promise<PartWithdrawal[]> {
  try {
    console.log('Fetching all part withdrawals');
    
    const { data, error } = await supabase
      .rpc('get_part_withdrawals')
      .select();

    if (error) {
      console.error('Error fetching part withdrawals:', error.message);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.log('No withdrawal data found or invalid data format');
      return [];
    }

    // Map the results to our PartWithdrawal type
    const withdrawals = data.map(item => ({
      id: item.id as string,
      part_id: item.part_id as number,
      quantity: item.quantity as number,
      withdrawn_by: item.withdrawn_by as string,
      withdrawn_at: item.withdrawn_at as string,
      equipment_id: item.equipment_id as number | undefined,
      task_id: item.task_id as number | undefined,
      notes: item.notes as string | undefined,
      farm_id: item.farm_id as string | undefined,
      created_at: item.created_at as string,
      part_name: item.part_name as string | undefined,
      equipment_name: item.equipment_name as string | undefined,
      user_name: item.user_name as string | undefined
    }));

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
      .rpc('get_withdrawals_for_part', { part_id_param: partId })
      .select();

    if (error) {
      console.error('Error fetching withdrawals for part:', error.message);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.log('No withdrawal data found for part');
      return [];
    }

    // Map the results to our PartWithdrawal type
    const withdrawals = data.map(item => ({
      id: item.id as string,
      part_id: item.part_id as number,
      quantity: item.quantity as number,
      withdrawn_by: item.withdrawn_by as string,
      withdrawn_at: item.withdrawn_at as string,
      equipment_id: item.equipment_id as number | undefined,
      task_id: item.task_id as number | undefined,
      notes: item.notes as string | undefined,
      farm_id: item.farm_id as string | undefined,
      created_at: item.created_at as string,
      part_name: item.part_name as string | undefined,
      equipment_name: item.equipment_name as string | undefined,
      user_name: item.user_name as string | undefined
    }));

    return withdrawals;
  } catch (error: any) {
    console.error(`Error in getWithdrawalsForPart(${partId}):`, error.message);
    return [];
  }
}
