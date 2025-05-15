
import { useCallback } from 'react';
import { WithdrawalRecord, WithdrawalReason } from './types';
import { WITHDRAWAL_REASONS } from './constants';
import { supabase } from '@/integrations/supabase/client';

export const useWithdrawalHistory = () => {
  // Function to get withdrawal history for a part
  const getWithdrawalHistory = useCallback(async (partId: number): Promise<WithdrawalRecord[]> => {
    try {
      console.log('Fetching withdrawal history for part:', partId);
      
      // Real implementation to fetch data from Supabase
      // Using 'from' with type assertion to bypass TypeScript checking
      const { data, error } = await supabase
        .from('parts_withdrawals' as any)
        .select(`
          id,
          part_id,
          quantity,
          reason,
          custom_reason,
          created_at,
          user_id,
          comment,
          intervention_id,
          interventions(id, title)
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
      
      // Transform the data to match our app's data structure
      return (data as any[]).map(item => ({
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
        interventions: item.interventions ? {
          id: item.interventions.id,
          title: item.interventions.title
        } : undefined,
        intervention_title: item.interventions?.title,
        comment: item.comment
      }));
      
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
