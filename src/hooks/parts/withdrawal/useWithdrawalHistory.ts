
import { useQuery } from '@tanstack/react-query';
import { WithdrawalRecord } from './types';
import { WITHDRAWAL_REASONS } from './constants';

export const useWithdrawalHistory = () => {
  // Récupérer l'historique des retraits pour une pièce
  const getWithdrawalHistory = async (partId: number): Promise<WithdrawalRecord[]> => {
    try {
      console.log('Getting withdrawal history for part ID:', partId);
      
      if (isNaN(partId) || partId <= 0) {
        console.error('Invalid part ID provided to getWithdrawalHistory:', partId);
        throw new Error('ID de pièce invalide');
      }
      
      // Generate mock data with the actual part ID provided
      return [
        {
          id: 1,
          part_id: partId,
          part_name: "Filtre",
          quantity: 2,
          reason: "intervention",
          custom_reason: null,
          intervention_id: 1,
          comment: "Utilisé lors de la maintenance programmée",
          user_id: "user-123",
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          interventions: { id: 1, title: "Maintenance préventive tracteur #1" }
        },
        {
          id: 2,
          part_id: partId,
          part_name: "Filtre",
          quantity: 1,
          reason: "defective",
          custom_reason: null,
          intervention_id: null,
          comment: "Défaut de fabrication",
          user_id: "user-123",
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          interventions: null
        },
        {
          id: 3,
          part_id: partId,
          part_name: "Filtre",
          quantity: 3,
          reason: "other",
          custom_reason: "Test de qualité",
          intervention_id: null,
          comment: "Utilisé pour des tests",
          user_id: "user-123",
          created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
          interventions: null
        }
      ];

      /* Real implementation when tables are ready:
      const { data, error } = await supabase
        .from('parts_withdrawals')
        .select(`
          *,
          interventions:intervention_id (id, title)
        `)
        .eq('part_id', partId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal history:', error);
        throw new Error(error.message);
      }

      return data;
      */
    } catch (error) {
      console.error('Error in getWithdrawalHistory:', error);
      throw error;
    }
  };

  // Format reason for display based on reason code
  const formatWithdrawalReason = (reason: string, customReason?: string | null) => {
    if (reason === 'other' && customReason) {
      return customReason;
    }
    
    const reasonObj = WITHDRAWAL_REASONS.find(r => r.id === reason);
    return reasonObj ? reasonObj.label : reason;
  };

  return {
    getWithdrawalHistory,
    formatWithdrawalReason,
    WITHDRAWAL_REASONS
  };
};
