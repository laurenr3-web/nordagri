
import { supabase } from '@/integrations/supabase/client';
import { PartWithdrawal } from '@/types/PartWithdrawal';

/**
 * Récupère l'historique des retraits de pièces
 * @param partId Optionnel - ID de la pièce pour filtrer les résultats
 * @returns Liste des retraits de pièces
 */
export async function getPartWithdrawals(partId?: number): Promise<PartWithdrawal[]> {
  try {
    // Utilisation d'une requête simple au lieu de SQL brut
    let query = supabase
      .from('parts_withdrawals')
      .select(`
        *,
        parts_inventory(name),
        equipment(name),
        profiles(first_name, last_name)
      `)
      .order('withdrawn_at', { ascending: false });
    
    // Ajouter un filtre par partId si fourni
    if (partId) {
      query = query.eq('part_id', partId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
      return [];
    }
    
    // Transformer les données au format PartWithdrawal
    return (data || []).map(row => ({
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
      
      // Champs joints
      part_name: row.parts_inventory?.name || `#${row.part_id}`,
      equipment_name: row.equipment?.name || (row.equipment_id ? `#${row.equipment_id}` : undefined),
      user_name: row.profiles ? `${row.profiles.first_name} ${row.profiles.last_name}`.trim() : undefined
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits de pièces:', error);
    return [];
  }
}

/**
 * Compte le nombre de retraits de pièces
 * @param partId Optionnel - ID de la pièce pour filtrer les résultats
 * @returns Nombre de retraits
 */
export async function getPartWithdrawalsCount(partId?: number): Promise<number> {
  try {
    let query = supabase
      .from('parts_withdrawals')
      .select('*', { count: 'exact', head: true });
    
    if (partId) {
      query = query.eq('part_id', partId);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Erreur lors du comptage des retraits:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des retraits de pièces:', error);
    return 0;
  }
}
