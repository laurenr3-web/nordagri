
import { supabase } from '@/integrations/supabase/client';
import { PartWithdrawal } from '@/types/PartWithdrawal';

/**
 * Fetches all part withdrawals from the database
 */
export async function getPartWithdrawals(): Promise<PartWithdrawal[]> {
  try {
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      throw new Error('Erreur de récupération de session');
    }
    
    const userId = sessionData.session?.user?.id;
    
    // If user is not authenticated, handle gracefully
    if (!userId) {
      console.warn('Utilisateur non authentifié, retourne un tableau de retraits vide');
      return [];
    }

    // Using raw SQL query instead of the query builder to handle potential type issues
    const { data, error } = await supabase.rpc('get_part_withdrawals');
    
    if (error) {
      console.error('Error fetching part withdrawals:', error);
      throw error;
    }

    // Convert to PartWithdrawal type
    const withdrawals: PartWithdrawal[] = (data || []).map((row: any) => ({
      id: row.id,
      part_id: row.part_id,
      quantity: row.quantity,
      withdrawn_by: row.withdrawn_by,
      withdrawn_at: row.withdrawn_at,
      equipment_id: row.equipment_id,
      task_id: row.task_id,
      notes: row.notes,
      farm_id: row.farm_id,
      created_at: row.created_at,
      part_name: row.part_name,
      equipment_name: row.equipment_name,
      user_name: row.user_name || 'Unknown user'
    }));

    return withdrawals;
  } catch (error) {
    console.error('Failed to fetch part withdrawals:', error);
    throw error;
  }
}

/**
 * Fetches withdrawals for a specific part
 */
export async function getWithdrawalsForPart(partId: number): Promise<PartWithdrawal[]> {
  try {
    // Using raw SQL query
    const { data, error } = await supabase.rpc('get_withdrawals_for_part', {
      part_id_param: partId
    });
    
    if (error) {
      console.error(`Error fetching withdrawals for part ${partId}:`, error);
      throw error;
    }

    // Convert to PartWithdrawal type
    const withdrawals: PartWithdrawal[] = (data || []).map((row: any) => ({
      id: row.id,
      part_id: row.part_id,
      quantity: row.quantity,
      withdrawn_by: row.withdrawn_by,
      withdrawn_at: row.withdrawn_at,
      equipment_id: row.equipment_id,
      task_id: row.task_id,
      notes: row.notes,
      farm_id: row.farm_id,
      created_at: row.created_at,
      part_name: row.part_name,
      equipment_name: row.equipment_name,
      user_name: row.user_name || 'Unknown user'
    }));

    return withdrawals;
  } catch (error) {
    console.error(`Failed to fetch withdrawals for part ${partId}:`, error);
    throw error;
  }
}
