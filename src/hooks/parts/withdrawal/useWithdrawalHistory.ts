
import { useCallback } from 'react';
import { WithdrawalRecord, WithdrawalReason } from './types';
import { WITHDRAWAL_REASONS } from './constants';
import { supabase } from '@/integrations/supabase/client';

export const useWithdrawalHistory = () => {
  // Function to get withdrawal history for a part
  const getWithdrawalHistory = useCallback(async (partId: number): Promise<WithdrawalRecord[]> => {
    try {
      console.log('Fetching withdrawal history for part:', partId);
      
      // Fetch withdrawal records without the intervention join
      const { data, error } = await supabase
        .from('parts_withdrawals')
        .select(`
          id,
          part_id,
          quantity,
          reason,
          custom_reason,
          created_at,
          user_id,
          comment,
          intervention_id
        `)
        .eq('part_id', partId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error fetching withdrawal history:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No withdrawal records found for part:', partId);
        return [];
      }
      
      console.log('Retrieved withdrawal records:', data.length);
      
      // Get all unique intervention IDs
      const interventionIds = data
        .filter(record => record.intervention_id)
        .map(record => record.intervention_id);
      
      // If there are interventions to fetch
      let interventionsMap = {};
      if (interventionIds.length > 0) {
        // Fetch intervention details separately
        const { data: interventionsData, error: interventionsError } = await supabase
          .from('interventions')
          .select('id, title')
          .in('id', interventionIds);
          
        if (interventionsError) {
          console.error('Error fetching interventions:', interventionsError);
        } else if (interventionsData) {
          // Create a map of interventions for easy lookup
          interventionsMap = interventionsData.reduce((acc, intervention) => {
            acc[intervention.id] = intervention;
            return acc;
          }, {});
        }
      }
      
      // Transform the data to match our app's data structure
      return data.map(item => {
        const intervention = item.intervention_id ? interventionsMap[item.intervention_id] : null;
        
        return {
          id: item.id,
          part_id: item.part_id,
          part_name: "", // We'll get this from the part itself
          quantity: item.quantity,
          reason: item.reason,
          custom_reason: item.custom_reason,
          date: item.created_at,
          created_at: item.created_at,
          user_name: "Utilisateur", // We'll implement user name fetching later
          intervention_id: item.intervention_id,
          interventions: intervention ? {
            id: intervention.id,
            title: intervention.title
          } : undefined,
          intervention_title: intervention ? intervention.title : undefined,
          comment: item.comment
        };
      });
      
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }, []);

  // Format reason text based on reason code and custom reason
  const formatWithdrawalReason = useCallback((reason: string, customReason?: string | null): string => {
    if (reason === 'other' && customReason) {
      return customReason;
    }

    const reasonObj = WITHDRAWAL_REASONS.find(r => r.id === reason);
    return reasonObj ? reasonObj.label : reason;
  }, []);

  return {
    getWithdrawalHistory,
    formatWithdrawalReason
  };
};
