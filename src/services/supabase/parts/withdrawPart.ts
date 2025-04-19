
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PartWithdrawalData {
  part_id: number;
  quantity: number;
  equipment_id?: number;
  task_id?: number;
  notes?: string;
}

/**
 * Retire une quantité spécifique d'une pièce de l'inventaire
 */
export async function withdrawPart(withdrawalData: PartWithdrawalData): Promise<boolean> {
  try {
    // Récupérer la ferme de l'utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('farm_id')
      .single();
      
    if (profileError) {
      console.error('Erreur de récupération du profil:', profileError);
      throw new Error('Impossible de déterminer votre ferme');
    }
    
    // Vérifier d'abord si le stock est suffisant
    const { data: partData, error: partError } = await supabase
      .from('parts_inventory')
      .select('quantity')
      .eq('id', withdrawalData.part_id)
      .single();
      
    if (partError) {
      console.error('Erreur lors de la récupération du stock:', partError);
      throw new Error('Impossible de vérifier le stock disponible');
    }
    
    if (!partData || partData.quantity < withdrawalData.quantity) {
      toast({
        title: "Stock insuffisant",
        description: "La quantité demandée dépasse le stock disponible",
        variant: "destructive",
      });
      return false;
    }
    
    // Utiliser une fonction RPC personnalisée ou SQL brut pour contourner les problèmes de typage
    const { data, error } = await supabase.rpc('withdraw_part', {
      p_part_id: withdrawalData.part_id,
      p_quantity: withdrawalData.quantity,
      p_equipment_id: withdrawalData.equipment_id,
      p_task_id: withdrawalData.task_id,
      p_notes: withdrawalData.notes,
      p_farm_id: profileData.farm_id
    });

    // Si la fonction RPC n'existe pas, utilisons une solution de contournement
    if (error && error.message.includes('function "withdraw_part" does not exist')) {
      console.log('Fonction RPC non trouvée, utilisation de méthodes alternatives');
      
      // Mise à jour du stock
      const { error: updateError } = await supabase
        .from('parts_inventory')
        .update({ quantity: partData.quantity - withdrawalData.quantity })
        .eq('id', withdrawalData.part_id);
        
      if (updateError) {
        console.error('Erreur lors de la mise à jour du stock:', updateError);
        throw updateError;
      }
      
      // Insertion directe du retrait via SQL brut
      const { error: insertError } = await supabase.rpc('insert_part_withdrawal', {
        p_part_id: withdrawalData.part_id,
        p_quantity: withdrawalData.quantity,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_equipment_id: withdrawalData.equipment_id,
        p_task_id: withdrawalData.task_id,
        p_notes: withdrawalData.notes,
        p_farm_id: profileData.farm_id
      });
      
      if (insertError) {
        console.error('Erreur lors de l\'insertion du retrait:', insertError);
        throw insertError;
      }
    } else if (error) {
      console.error('Erreur lors du retrait de pièce:', error);
      
      toast({
        title: "Erreur",
        description: "Impossible de retirer cette pièce",
        variant: "destructive",
      });
      
      return false;
    }
    
    toast({
      title: "Retrait effectué",
      description: `${withdrawalData.quantity} unité(s) retirée(s) avec succès`,
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors du retrait de pièce:', error);
    toast({
      title: "Erreur",
      description: "Impossible de retirer cette pièce",
      variant: "destructive",
    });
    return false;
  }
}
