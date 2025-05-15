
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Part } from '@/types/Part';
import { Intervention, PartsWithdrawal } from './types';

export const useWithdrawalDialog = () => {
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const queryClient = useQueryClient();

  // Récupérer les interventions pour le dropdown
  const { data: interventions = [] } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      try {
        console.log('Fetching interventions for withdrawal dialog');
        
        const { data, error } = await supabase
          .from('interventions')
          .select('id, title, equipment_id, date, status')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching interventions:', error);
          throw error;
        }
        
        return data as Intervention[];
      } catch (error) {
        console.error('Error fetching interventions:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Mutation for submitting a withdrawal
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawal: PartsWithdrawal) => {
      console.log("Withdrawal mutation called with:", withdrawal);
      
      // Get current user ID
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // 1. Insert the withdrawal record
      const { data, error } = await supabase
        .from('parts_withdrawals')
        .insert({
          part_id: withdrawal.part_id,
          quantity: withdrawal.quantity,
          reason: withdrawal.reason,
          custom_reason: withdrawal.reason === 'other' ? withdrawal.custom_reason : null,
          intervention_id: withdrawal.intervention_id || null,
          comment: withdrawal.comment,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting withdrawal record:', error);
        throw error;
      }

      // 2. Update the part's stock
      try {
        // Call the decrement_part_stock function we created in SQL
        const { error: updateError } = await supabase.rpc('decrement_part_stock', {
          p_part_id: withdrawal.part_id,
          p_quantity: withdrawal.quantity
        });

        if (updateError) {
          console.error('Error updating part stock:', updateError);
          throw updateError;
        }
      } catch (stockError: any) {
        // If stock update fails, we should delete the withdrawal record
        await supabase
          .from('parts_withdrawals')
          .delete()
          .eq('id', data.id);
          
        throw new Error(stockError.message || 'Erreur lors de la mise à jour du stock');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate queries to force data reload
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalHistory'] });
      toast.success('Pièce retirée avec succès');
      setIsWithdrawalDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error: any) => {
      console.error('Error submitting withdrawal:', error);
      toast.error('Erreur lors du retrait de la pièce: ' + error.message);
    }
  });

  // Open the withdrawal dialog for a specific part or for all parts if none specified
  const openWithdrawalDialog = (part?: Part) => {
    console.log("Opening withdrawal dialog for part:", part);
    setSelectedPart(part || null);
    setIsWithdrawalDialogOpen(true);
  };

  return {
    isWithdrawalDialogOpen,
    setIsWithdrawalDialogOpen,
    selectedPart,
    setSelectedPart,
    openWithdrawalDialog,
    withdrawalMutation,
    interventions,
  };
};

// Export the types for use in other files
export type { PartsWithdrawal, Intervention };
