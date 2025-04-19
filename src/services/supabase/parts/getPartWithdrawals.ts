
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

    // Until the RPC functions are properly set up, we'll use raw SQL queries with the REST API
    // This is a temporary solution and should be replaced with proper RPC once the functions are added
    const { data, error } = await supabase
      .from('parts_withdrawals')
      .select(`
        id,
        part_id,
        quantity,
        withdrawn_by,
        withdrawn_at,
        equipment_id,
        task_id,
        notes,
        farm_id,
        created_at,
        parts_inventory!parts_withdrawals_part_id_fkey (name),
        equipment!parts_withdrawals_equipment_id_fkey (name)
      `)
      .order('created_at', { ascending: false });
    
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
      part_name: row.parts_inventory?.name || 'Unknown part',
      equipment_name: row.equipment?.name || undefined,
      user_name: 'Unknown user' // We'll need to add a profiles join to get the user name
    }));

    return withdrawals;
  } catch (error: any) {
    console.error('Failed to fetch part withdrawals:', error);
    throw error;
  }
}

/**
 * Fetches withdrawals for a specific part
 */
export async function getWithdrawalsForPart(partId: number): Promise<PartWithdrawal[]> {
  try {
    // Using the query builder with join approach
    const { data, error } = await supabase
      .from('parts_withdrawals')
      .select(`
        id,
        part_id,
        quantity,
        withdrawn_by,
        withdrawn_at,
        equipment_id,
        task_id,
        notes,
        farm_id,
        created_at,
        parts_inventory!parts_withdrawals_part_id_fkey (name),
        equipment!parts_withdrawals_equipment_id_fkey (name)
      `)
      .eq('part_id', partId)
      .order('created_at', { ascending: false });
    
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
      part_name: row.parts_inventory?.name || 'Unknown part',
      equipment_name: row.equipment?.name || undefined,
      user_name: 'Unknown user' // We'll need to add a profiles join to get the user name
    }));

    return withdrawals;
  } catch (error: any) {
    console.error(`Failed to fetch withdrawals for part ${partId}:`, error);
    throw error;
  }
}
