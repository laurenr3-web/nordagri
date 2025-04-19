
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
    
    // Mettre à jour le stock dans parts_inventory
    const { error: updateError } = await supabase
      .from('parts_inventory')
      .update({ quantity: partData.quantity - withdrawalData.quantity })
      .eq('id', withdrawalData.part_id);
      
    if (updateError) {
      console.error('Erreur lors de la mise à jour du stock:', updateError);
      throw updateError;
    }
    
    // Insérer le retrait par insertion SQL directe pour contourner les problèmes de typage
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const insertQuery = `
      INSERT INTO parts_withdrawals (
        part_id, quantity, withdrawn_by, equipment_id, task_id, notes, farm_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    const { error: insertError } = await supabase.rpc('execute_sql', {
      query_text: insertQuery,
      query_params: [
        withdrawalData.part_id,
        withdrawalData.quantity,
        userId,
        withdrawalData.equipment_id || null,
        withdrawalData.task_id || null,
        withdrawalData.notes || null,
        profileData.farm_id
      ]
    });
    
    if (insertError) {
      console.error('Erreur lors de l\'insertion du retrait:', insertError);
      
      // En cas d'erreur, essayons de restaurer le stock
      try {
        await supabase
          .from('parts_inventory')
          .update({ quantity: partData.quantity })
          .eq('id', withdrawalData.part_id);
      } catch (rollbackError) {
        console.error('Erreur lors de la restauration du stock:', rollbackError);
      }
      
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
