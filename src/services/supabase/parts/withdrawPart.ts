
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
    
    const { data, error } = await supabase
      .from('parts_withdrawals')
      .insert({
        part_id: withdrawalData.part_id,
        quantity: withdrawalData.quantity,
        withdrawn_by: (await supabase.auth.getUser()).data.user?.id,
        equipment_id: withdrawalData.equipment_id,
        task_id: withdrawalData.task_id,
        notes: withdrawalData.notes,
        farm_id: profileData.farm_id
      })
      .select();

    if (error) {
      console.error('Erreur lors du retrait de pièce:', error);
      
      if (error.message.includes('Stock insuffisant')) {
        toast({
          title: "Stock insuffisant",
          description: "La quantité demandée dépasse le stock disponible",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de retirer cette pièce",
          variant: "destructive",
        });
      }
      
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
