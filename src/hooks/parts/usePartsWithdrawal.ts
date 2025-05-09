
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
        const { data, error } = await supabase
          .from('interventions')
          .select('id, title, equipment_id, date, status')
          .order('date', { ascending: false });

        if (error) throw error;
        return data as Intervention[];
      } catch (error) {
        console.error('Error fetching interventions:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Récupérer l'historique des retraits pour une pièce
  const getWithdrawalHistory = async (partId: number) => {
    try {
      const { data, error } = await supabase
        .from('parts_withdrawals')
        .select(`
          id, 
          part_id, 
          part_name, 
          quantity, 
          reason, 
          custom_reason, 
          intervention_id, 
          comment, 
          user_id, 
          created_at,
          interventions (id, title)
        `)
        .eq('part_id', partId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  };

  // Mutation pour soumettre un retrait
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawal: PartsWithdrawal) => {
      // 1. Insérer le retrait dans la table parts_withdrawals
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

      // 2. Mettre à jour le stock de la pièce
      const { error: updateError } = await supabase
        .from('parts')
        .update({ stock: supabase.rpc('decrement', { row_id: withdrawal.part_id, amount: withdrawal.quantity }) })
        .eq('id', withdrawal.part_id);

      if (updateError) throw updateError;

      return withdrawalData;
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
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

  // Ouvrir la modale de retrait pour une pièce spécifique
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
