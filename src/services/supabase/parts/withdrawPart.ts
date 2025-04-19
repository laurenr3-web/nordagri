
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for withdrawal request data
 */
export interface PartWithdrawalRequest {
  part_id: number;
  quantity: number;
  equipment_id?: number | null;
  task_id?: number | null;
  notes?: string;
}

/**
 * Withdraws a part from inventory
 * @param withdrawalData The withdrawal data
 * @returns The withdrawal record
 */
export async function withdrawPart(withdrawalData: PartWithdrawalRequest): Promise<{ success: boolean, message: string, id?: string }> {
  try {
    // Check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error('Session error: ' + sessionError.message);
    }
    
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error('You must be logged in to withdraw parts');
    }

    // Get user's farm_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('farm_id')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw new Error('Error fetching profile data: ' + profileError.message);
    }
    
    // Validate quantity
    if (!withdrawalData.quantity || withdrawalData.quantity <= 0) {
      return { success: false, message: 'La quantité doit être supérieure à 0' };
    }
    
    // Check if part has enough quantity
    const { data: partData, error: partError } = await supabase
      .from('parts_inventory')
      .select('quantity')
      .eq('id', withdrawalData.part_id)
      .single();
      
    if (partError) {
      throw new Error(`Error fetching part data: ${partError.message}`);
    }
    
    if (!partData) {
      return { success: false, message: 'Pièce non trouvée' };
    }
    
    if (partData.quantity < withdrawalData.quantity) {
      return { success: false, message: `Stock insuffisant. Disponible: ${partData.quantity}` };
    }

    // Using the insert API with a transaction managed by the trigger
    const { data, error } = await supabase
      .from('parts_withdrawals')
      .insert({
        part_id: withdrawalData.part_id,
        quantity: withdrawalData.quantity,
        withdrawn_by: userId,
        equipment_id: withdrawalData.equipment_id || null,
        task_id: withdrawalData.task_id || null,
        notes: withdrawalData.notes || null,
        farm_id: profileData.farm_id,
        withdrawn_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error('Error withdrawing part:', error);
      return { 
        success: false, 
        message: error.message.includes('Stock insuffisant') 
          ? 'Stock insuffisant pour cette quantité' 
          : `Erreur lors du retrait: ${error.message}` 
      };
    }
    
    return { 
      success: true, 
      message: 'Pièce retirée avec succès', 
      id: data[0]?.id as string 
    };
  } catch (error: any) {
    console.error('Withdrawal part error:', error);
    return { success: false, message: `Erreur: ${error.message}` };
  }
}
