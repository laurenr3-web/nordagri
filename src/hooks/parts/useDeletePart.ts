
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';

export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (partId: number | string) => {
      console.log('Deleting part ID:', partId);
      return await deletePart(partId);
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch parts query
      console.log('Successfully deleted part ID:', variables);
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce supprimée",
        description: `La pièce a été supprimée avec succès.`,
      });
      
      // We're removing the navigation from here to avoid issues
      // Navigation will be handled by the components that use this hook
    },
    onError: (error: any) => {
      console.error('Error in deletePart mutation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la pièce",
        variant: "destructive",
      });
    }
  });

  return mutation;
}
