
import { supabase } from '@/integrations/supabase/client';

export const getPartWithdrawals = async (partId: string | number) => {
  try {
    const parsedPartId = typeof partId === 'string' ? parseInt(partId, 10) : partId;
    
    const { data, error } = await supabase
      .from('part_withdrawals')
      .select(`
        id,
        part_id,
        quantity,
        equipment_id,
        notes,
        withdrawn_at,
        withdrawn_by,
        equipment (
          name
        ),
        profiles!part_withdrawals_withdrawn_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('part_id', parsedPartId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching part withdrawals:", error);
      throw error;
    }

    // Transform the data to a more usable format with null checks
    return data.map(item => ({
      id: item.id,
      partId: item.part_id,
      quantity: item.quantity,
      equipmentId: item.equipment_id,
      equipmentName: item.equipment?.name || 'N/A',
      notes: item.notes,
      withdrawnAt: item.withdrawn_at,
      withdrawnBy: {
        id: item.withdrawn_by,
        name: item.profiles?.first_name && item.profiles?.last_name 
          ? `${item.profiles.first_name} ${item.profiles.last_name}`
          : 'Inconnu'
      }
    }));
  } catch (error) {
    console.error("Error in getPartWithdrawals:", error);
    throw error;
  }
};
