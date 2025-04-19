
import { supabase } from '@/integrations/supabase/client';
import { WithdrawPartData } from '@/types/PartWithdrawal';
import { toast } from '@/hooks/use-toast';

/**
 * Withdraw a part from inventory
 * Uses a stored procedure that handles:
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

    // Call the withdraw_part database function
    const { data, error } = await supabase.rpc('withdraw_part', {
      p_part_id: withdrawData.part_id,
      p_quantity: withdrawData.quantity,
      p_equipment_id: withdrawData.equipment_id || null,
      p_task_id: withdrawData.task_id || null,
      p_notes: withdrawData.notes || null,
      p_farm_id: withdrawData.farm_id || null
    });

    if (error) {
      console.error('Error withdrawing part:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || 'Erreur lors du retrait de la pièce'
      });
      return { success: false, error: error.message };
    }

    // The function should return the ID of the newly created withdrawal
    const withdrawalId = typeof data === 'string' ? data : undefined;
    
    console.log('Part withdrawn successfully, ID:', withdrawalId);
    
    return { 
      success: true,
      id: withdrawalId 
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
