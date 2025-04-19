
import { supabase } from '@/integrations/supabase/client';
import { PartWithdrawal } from '@/types/PartWithdrawal';

/**
 * Récupère l'historique des retraits de pièces
 * @param partId Optionnel - ID de la pièce pour filtrer les résultats
 * @returns Liste des retraits de pièces
 */
export async function getPartWithdrawals(partId?: number): Promise<PartWithdrawal[]> {
  try {
    // Utiliser le SQL brut pour contourner les problèmes de typage de Supabase
    let query = `
      SELECT 
        pw.*,
        pi.name as part_name,
        e.name as equipment_name,
        CONCAT(p.first_name, ' ', p.last_name) as user_name
      FROM parts_withdrawals pw
      LEFT JOIN parts_inventory pi ON pw.part_id = pi.id
      LEFT JOIN equipment e ON pw.equipment_id = e.id
      LEFT JOIN profiles p ON pw.withdrawn_by = p.id
    `;

    const params: any[] = [];
    
    if (partId) {
      query += " WHERE pw.part_id = $1";
      params.push(partId);
    }
    
    query += " ORDER BY pw.withdrawn_at DESC";
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      query_text: query,
      query_params: params
    });
    
    if (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
      
      // Fallback: essayer avec une approche plus simple
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('parts_withdrawals')
        .select('*')
        .order('withdrawn_at', { ascending: false });
      
      if (fallbackError) {
        throw fallbackError;
      }
      
      return fallbackData as unknown as PartWithdrawal[];
    }
    
    return data as PartWithdrawal[];
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
    const query = `
      SELECT COUNT(*) as count
      FROM parts_withdrawals
      ${partId ? 'WHERE part_id = $1' : ''}
    `;
    
    const params = partId ? [partId] : [];
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      query_text: query,
      query_params: params
    });
    
    if (error) {
      console.error('Erreur lors du comptage des retraits:', error);
      
      // Approche alternative
      try {
        // Utiliser le API REST directement si RPC échoue
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/parts_withdrawals?select=count`, {
          headers: {
            'apikey': supabase.supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          },
          method: 'HEAD'
        });
        
        const count = response.headers.get('content-range')?.split('/')[1];
        return count ? parseInt(count, 10) : 0;
      } catch (fetchError) {
        console.error('Erreur lors du comptage alternatif:', fetchError);
        return 0;
      }
    }
    
    return data[0]?.count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des retraits de pièces:', error);
    return 0;
  }
}
