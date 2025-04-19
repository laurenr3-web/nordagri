
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
        )
      `)
      .eq('part_id', parsedPartId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching part withdrawals:", error);
      throw error;
    }

    // Get user profiles in a separate query
    const userIds = data.map(item => item.withdrawn_by).filter(id => id);
    let profiles: Record<string, { first_name?: string; last_name?: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (!profilesError && profilesData) {
        profiles = profilesData.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile
        }), {});
      }
    }

    // Transform the data to a more usable format with null checks
    return data.map(item => {
      const profile = item.withdrawn_by ? profiles[item.withdrawn_by] : null;
      const userName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Inconnu'
        : 'Inconnu';
      
      return {
        id: item.id,
        partId: item.part_id,
        quantity: item.quantity,
        equipmentId: item.equipment_id,
        equipmentName: item.equipment?.name || 'N/A',
        notes: item.notes,
        withdrawnAt: item.withdrawn_at,
        withdrawnBy: {
          id: item.withdrawn_by,
          name: userName
        }
      };
    });
  } catch (error) {
    console.error("Error in getPartWithdrawals:", error);
    throw error;
  }
};
