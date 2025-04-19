
import { supabase } from '@/integrations/supabase/client';

export interface PartWithdrawal {
  id: string;
  part_id: number;
  quantity: number;
  withdrawn_by: string;
  withdrawn_at: string;
  equipment_id?: number;
  task_id?: number;
  notes?: string;
  part_name?: string;
  equipment_name?: string;
  user_name?: string;
}

export async function getPartWithdrawals(partId?: number) {
  try {
    let query = supabase
      .from('parts_withdrawals')
      .select(`
        *,
        parts_inventory!parts_withdrawals_part_id_fkey (name),
        equipment!parts_withdrawals_equipment_id_fkey (name),
        profiles!parts_withdrawals_withdrawn_by_fkey (first_name, last_name)
      `)
      .order('withdrawn_at', { ascending: false });
    
    if (partId) {
      query = query.eq('part_id', partId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Formater les données pour un affichage plus facile
    return data.map(withdrawal => ({
      ...withdrawal,
      part_name: withdrawal.parts_inventory?.name,
      equipment_name: withdrawal.equipment?.name,
      user_name: `${withdrawal.profiles?.first_name || ''} ${withdrawal.profiles?.last_name || ''}`.trim()
    }));
    
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits de pièces:', error);
    throw error;
  }
}

export async function getPartWithdrawalsCount(partId?: number): Promise<number> {
  try {
    let query = supabase
      .from('parts_withdrawals')
      .select('id', { count: 'exact' });
    
    if (partId) {
      query = query.eq('part_id', partId);
    }
    
    const { count, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des retraits de pièces:', error);
    return 0;
  }
}
