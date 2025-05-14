
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { toast } from 'sonner';

export const useDeleteIntervention = () => {
  const queryClient = useQueryClient();
  
  const deleteIntervention = useMutation({
    mutationFn: async (interventionId: number) => {
      return await interventionService.deleteIntervention(interventionId);
    },
    onSuccess: () => {
      toast.success('Intervention supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de l\'intervention:', error);
      toast.error('Erreur lors de la suppression de l\'intervention', { 
        description: error?.message || 'Une erreur est survenue'
      });
    }
  });
  
  return {
    deleteIntervention: deleteIntervention.mutate,
    isDeleting: deleteIntervention.isPending,
    error: deleteIntervention.error
  };
};
