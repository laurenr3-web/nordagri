
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';

export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (partId: number | string) => {
      return deletePart(partId);
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch parts query
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce supprimée",
        description: `La pièce a été supprimée avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la pièce",
        variant: "destructive",
      });
    }
  });

  return mutation;
}
