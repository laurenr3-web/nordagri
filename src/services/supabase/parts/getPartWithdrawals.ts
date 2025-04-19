
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

export async function getPartWithdrawals(partId?: number): Promise<PartWithdrawal[]> {
  try {
    // Le type de Supabase ne reconnaît pas encore la table parts_withdrawals
    // On utilise donc une approche SQL plus directe avec .from('parts_withdrawals') et des type cast
    let query = supabase.from('parts_withdrawals').select(`
      id,
      part_id,
      quantity,
      withdrawn_by,
      withdrawn_at,
      equipment_id,
      task_id,
      notes,
      farm_id
    `) as any;
    
    if (partId) {
      query = query.eq('part_id', partId);
    }
    
    const { data, error } = await query.order('withdrawn_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
      throw error;
    }
    
    // Si la jointure n'est pas possible à cause des types, récupérer les données séparément
    const result: PartWithdrawal[] = [];
    
    for (const withdrawal of data || []) {
      let partName = '';
      let equipmentName = '';
      let userName = '';
      
      // Récupérer le nom de la pièce
      if (withdrawal?.part_id) {
        const { data: partData } = await supabase
          .from('parts_inventory')
          .select('name')
          .eq('id', withdrawal.part_id)
          .single();
        
        if (partData) partName = partData.name;
      }
      
      // Récupérer le nom de l'équipement si présent
      if (withdrawal?.equipment_id) {
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('name')
          .eq('id', withdrawal.equipment_id)
          .single();
        
        if (equipmentData) equipmentName = equipmentData.name;
      }
      
      // Récupérer le nom de l'utilisateur
      if (withdrawal?.withdrawn_by) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', withdrawal.withdrawn_by)
          .single();
        
        if (userData) {
          userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        }
      }
      
      result.push({
        ...withdrawal,
        part_name: partName,
        equipment_name: equipmentName,
        user_name: userName
      });
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits de pièces:', error);
    throw error;
  }
}

export async function getPartWithdrawalsCount(partId?: number): Promise<number> {
  try {
    // Utilisation de SQL brute pour contourner les problèmes de typage
    const query = supabase.from('parts_withdrawals');
    
    if (partId) {
      query.eq('part_id', partId);
    }
    
    const { count, error } = await query.select('*', { count: 'exact', head: true }) as any;
    
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
