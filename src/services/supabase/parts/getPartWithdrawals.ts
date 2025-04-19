
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
    // Utilisez la méthode rpc pour une requête personnalisée si la table n'est pas
    // correctement détectée par le typage généré de Supabase
    let query = supabase.rpc('get_part_withdrawals', partId ? { part_id_param: partId } : {});
    
    // Si l'appel à rpc ne fonctionne pas, nous devons utiliser une requête SQL brute
    if (!query) {
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
          farm_id
        `)
        .order('withdrawn_at', { ascending: false });
      
      if (partId) {
        // @ts-ignore - Ignorer l'erreur de type car la table existe mais n'est pas dans la définition de type
        query = query.eq('part_id', partId);
      }
      
      if (error) {
        throw error;
      }
      
      // Si la jointure n'est pas possible à cause des types, récupérer les données séparément
      const result: PartWithdrawal[] = [];
      
      for (const withdrawal of data || []) {
        let partName = '';
        let equipmentName = '';
        let userName = '';
        
        // Récupérer le nom de la pièce
        if (withdrawal.part_id) {
          const { data: partData } = await supabase
            .from('parts_inventory')
            .select('name')
            .eq('id', withdrawal.part_id)
            .single();
          
          if (partData) partName = partData.name;
        }
        
        // Récupérer le nom de l'équipement si présent
        if (withdrawal.equipment_id) {
          const { data: equipmentData } = await supabase
            .from('equipment')
            .select('name')
            .eq('id', withdrawal.equipment_id)
            .single();
          
          if (equipmentData) equipmentName = equipmentData.name;
        }
        
        // Récupérer le nom de l'utilisateur
        if (withdrawal.withdrawn_by) {
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
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Formater les données pour un affichage plus facile
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits de pièces:', error);
    throw error;
  }
}

export async function getPartWithdrawalsCount(partId?: number): Promise<number> {
  try {
    // Utilisation de rpc ou requête SQL brute pour contourner les problèmes de typage
    const { count, error } = await supabase.rpc(
      'count_part_withdrawals', 
      partId ? { part_id_param: partId } : {}
    );
    
    if (error) {
      console.error('Erreur lors du comptage des retraits:', error);
      
      // Alternative si la fonction rpc n'existe pas
      const { data, error: countError } = await supabase
        .from('parts_withdrawals')
        .select('id', { count: 'exact', head: true });
        
      if (countError) {
        throw countError;
      }
      
      return data?.length || 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des retraits de pièces:', error);
    return 0;
  }
}
