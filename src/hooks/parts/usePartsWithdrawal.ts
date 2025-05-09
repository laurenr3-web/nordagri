
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Part } from '@/types/Part';

export interface WithdrawalReason {
  id: string;
  label: string;
  requiresComment?: boolean;
}

export interface Intervention {
  id: number;
  title: string;
  equipment_id?: number;
  date?: string;
  status?: string;
}

export interface PartsWithdrawal {
  id?: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string;
  intervention_id?: number | null;
  comment?: string;
  user_id?: string;
  created_at?: string;
}

export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  { id: 'intervention', label: 'Utilisée dans une intervention' },
  { id: 'defective', label: 'Pièce défectueuse' },
  { id: 'lost', label: 'Perte ou vol' },
  { id: 'return', label: 'Retour fournisseur' },
  { id: 'other', label: 'Autre', requiresComment: true }
];

export const usePartsWithdrawal = () => {
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const queryClient = useQueryClient();

  // Récupérer les interventions pour le dropdown
  const { data: interventions = [] } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      try {
        // Temporarily mock interventions data until the Supabase tables are set up
        return [
          { id: 1, title: "Maintenance préventive tracteur #1", equipment_id: 1, date: "2024-06-01", status: "planned" },
          { id: 2, title: "Réparation moissonneuse", equipment_id: 2, date: "2024-05-28", status: "in_progress" },
          { id: 3, title: "Révision système hydraulique", equipment_id: 3, date: "2024-05-20", status: "completed" }
        ] as Intervention[];
        
        /* Real implementation when tables are ready:
        const { data, error } = await supabase
          .from('interventions')
          .select('id, title, equipment_id, date, status')
          .order('date', { ascending: false });

        if (error) throw error;
        return data as Intervention[];
        */
      } catch (error) {
        console.error('Error fetching interventions:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Récupérer l'historique des retraits pour une pièce
  const getWithdrawalHistory = async (partId: number) => {
    // For now, return mock data
    return [
      {
        id: 1,
        part_id: partId,
        part_name: "Test Part",
        quantity: 2,
        reason: "intervention",
        custom_reason: null,
        intervention_id: 1,
        comment: "Used during scheduled maintenance",
        user_id: "user-123",
        created_at: new Date().toISOString(),
        interventions: { id: 1, title: "Maintenance préventive tracteur #1" }
      },
      {
        id: 2,
        part_id: partId,
        part_name: "Test Part",
        quantity: 1,
        reason: "defective",
        custom_reason: null,
        intervention_id: null,
        comment: "Manufacturing defect",
        user_id: "user-123",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        interventions: null
      }
    ];
  };

  // Mutation for submitting a withdrawal
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawal: PartsWithdrawal) => {
      // For testing/demo purposes, just return the withdrawal data
      console.log("Withdrawal mutation called with:", withdrawal);
      
      // Simulate successful withdrawal
      const partToUpdate = selectedPart;
      if (partToUpdate) {
        partToUpdate.stock -= withdrawal.quantity;
      }
      
      return withdrawal;
      
      /* Real implementation when tables are ready:
      // 1. Insert the withdrawal into parts_withdrawals table
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('parts_withdrawals')
        .insert({
          part_id: withdrawal.part_id,
          part_name: withdrawal.part_name,
          quantity: withdrawal.quantity,
          reason: withdrawal.reason,
          custom_reason: withdrawal.reason === 'other' ? withdrawal.custom_reason : null,
          intervention_id: withdrawal.intervention_id || null,
          comment: withdrawal.comment,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      // 2. Update the part's stock
      const { error: updateError } = await supabase
        .from('parts')
        .update({ 
          stock: supabase.rpc('decrement', { 
            row_id: withdrawal.part_id, 
            amount: withdrawal.quantity 
          }) 
        })
        .eq('id', withdrawal.part_id);

      if (updateError) throw updateError;

      return withdrawalData;
      */
    },
    onSuccess: () => {
      // Invalidate queries to force data reload
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Pièce retirée avec succès');
      setIsWithdrawalDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error: any) => {
      console.error('Error submitting withdrawal:', error);
      toast.error('Erreur lors du retrait de la pièce: ' + error.message);
    }
  });

  // Open the withdrawal dialog for a specific part
  const openWithdrawalDialog = (part: Part) => {
    setSelectedPart(part);
    setIsWithdrawalDialogOpen(true);
  };

  return {
    isWithdrawalDialogOpen,
    setIsWithdrawalDialogOpen,
    selectedPart,
    setSelectedPart,
    openWithdrawalDialog,
    withdrawalMutation,
    getWithdrawalHistory,
    interventions,
    WITHDRAWAL_REASONS
  };
};
