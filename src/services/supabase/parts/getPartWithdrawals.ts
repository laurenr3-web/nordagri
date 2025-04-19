
import { supabase } from '@/integrations/supabase/client';

const transformWithdrawal = (item: any) => ({
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
      : 'Unknown'
  }
});

export const getPartWithdrawals = async (partId: string | number) => {
  try {
    // Convert partId to the correct type if needed
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
        profiles (
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
    const withdrawals = data.map(item => ({
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
          : 'Unknown'
      }
    }));
    
    return withdrawals;
  } catch (error) {
    console.error("Error in getPartWithdrawals:", error);
    throw error;
  }
};
