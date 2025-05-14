
import { useCallback } from 'react';
import { WithdrawalRecord, WithdrawalReason } from './types';
import { WITHDRAWAL_REASONS } from './constants';
import { supabase } from '@/integrations/supabase/client';

export const useWithdrawalHistory = () => {
  // Function to get withdrawal history for a part
  const getWithdrawalHistory = useCallback(async (partId: number): Promise<WithdrawalRecord[]> => {
    try {
      console.log('Fetching withdrawal history for part:', partId);
      
      // For demo/testing purposes, return mock data
      // In production, this would be replaced with actual API call
      const mockData: WithdrawalRecord[] = [
        {
          id: 1,
          part_id: partId,
          part_name: "Example Part",
          quantity: 2,
          reason: "maintenance",
          date: "2024-05-10T14:30:00",
          user_name: "Jean Dupont",
          intervention_id: 123,
          intervention_title: "Maintenance tracteur"
        },
        {
          id: 2,
          part_id: partId,
          part_name: "Example Part",
          quantity: 1,
          reason: "repair",
          date: "2024-05-08T10:15:00",
          user_name: "Sophie Martin",
          comment: "Remplacement urgent"
        },
        {
          id: 3,
          part_id: partId,
          part_name: "Example Part",
          quantity: 3,
          reason: "other",
          custom_reason: "Préparation stock saison",
          date: "2024-05-05T16:45:00",
          user_name: "Alexandre Petit"
        }
      ];
      
      return mockData;
      
      /* Real implementation when table is ready:
      const { data, error } = await supabase
        .from('parts_withdrawals')
        .select(`
          id,
          part_id,
          part_name,
          quantity,
          reason,
          custom_reason,
          created_at,
          users(name),
          intervention_id,
          interventions(title),
          comment
        `)
        .eq('part_id', partId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        part_id: item.part_id,
        part_name: item.part_name,
        quantity: item.quantity,
        reason: item.reason,
        custom_reason: item.custom_reason,
        date: item.created_at,
        user_name: item.users ? item.users.name : 'Utilisateur inconnu',
        intervention_id: item.intervention_id,
        intervention_title: item.interventions ? item.interventions.title : undefined,
        comment: item.comment
      }));
      */
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }, []);

  // Format reason text based on reason code and custom reason
  const formatWithdrawalReason = useCallback((reason: string, customReason?: string): string => {
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
