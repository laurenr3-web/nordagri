
import { supabase } from '@/integrations/supabase/client';
import { WithdrawPartData } from '@/types/PartWithdrawal';
import { toast } from '@/hooks/use-toast';

/**
 * Withdraw a part from inventory
 * Handles:
 * - Check if enough quantity is available
 * - Insert withdrawal record
 * - Update parts_inventory quantity
 */
export async function withdrawPart(withdrawData: WithdrawPartData): Promise<{success: boolean; error?: string; id?: string}> {
  try {
    console.log('Withdrawing part with data:', withdrawData);

    // Get the user's farm_id if not provided
    if (!withdrawData.farm_id) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileData?.farm_id) {
          withdrawData.farm_id = profileData.farm_id;
        }
      }
    }

    // Get current user ID if not provided
    if (!withdrawData.withdrawn_by) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        withdrawData.withdrawn_by = sessionData.session.user.id;
      }
    }

    // Check if there's enough inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('parts_inventory')
      .select('quantity')
      .eq('id', withdrawData.part_id)
      .single();
    
    if (inventoryError) {
      console.error('Error checking inventory:', inventoryError);
      return { success: false, error: inventoryError.message };
    }
    
    if (!inventoryData || inventoryData.quantity < withdrawData.quantity) {
      const errorMsg = `Stock insuffisant. Disponible: ${inventoryData?.quantity || 0}, Demandé: ${withdrawData.quantity}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Begin a transaction using supabase-js (Note: This is not a true transaction, just sequential operations)
    
    // 1. Insert withdrawal record
    const { data: withdrawalData, error: withdrawalError } = await supabase
      .from('part_withdrawals')
      .insert({
        part_id: withdrawData.part_id,
        quantity: withdrawData.quantity,
        withdrawn_by: withdrawData.withdrawn_by,
        equipment_id: withdrawData.equipment_id || null,
        task_id: withdrawData.task_id || null,
        notes: withdrawData.notes || null,
        farm_id: withdrawData.farm_id || null,
        withdrawn_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (withdrawalError) {
      console.error('Error creating withdrawal record:', withdrawalError);
      return { success: false, error: withdrawalError.message };
    }
    
    // 2. Update inventory quantity
    const { error: updateError } = await supabase
      .from('parts_inventory')
      .update({ 
        quantity: inventoryData.quantity - withdrawData.quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawData.part_id);
    
    if (updateError) {
      console.error('Error updating inventory:', updateError);
      // Note: In a real transaction, we would roll back the withdrawal insertion here
      return { success: false, error: updateError.message };
    }
    
    console.log('Part withdrawn successfully, ID:', withdrawalData.id);
    
    return { 
      success: true,
      id: withdrawalData.id 
    };
  } catch (error: any) {
    console.error('Error in withdrawPart:', error);
    
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.message || 'Une erreur s\'est produite lors du retrait de la pièce'
    });
    
    return {
      success: false,
      error: error.message || 'Erreur inconnue'
    };
  }
}

/**
 * Check if withdrawal is possible for given quantity
 */
export async function checkWithdrawalAvailability(partId: number, quantity: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('quantity')
      .eq('id', partId)
      .single();

    if (error) {
      console.error('Error checking withdrawal availability:', error);
      return false;
    }

    return data && data.quantity >= quantity;
  } catch (error) {
    console.error('Error in checkWithdrawalAvailability:', error);
    return false;
  }
}
