
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';

/**
 * Hook pour supprimer une pièce avec les mutations React Query
 * Fournit des notifications toast appropriées et l'invalidation du cache
 */
export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (partId: number) => {
      console.log('🗑️ Tentative de suppression de la pièce:', partId);
      if (!partId || isNaN(Number(partId))) {
        throw new Error("ID de pièce invalide");
      }
      return deletePart(partId);
    },
    onMutate: async (partId: number) => {
      await queryClient.cancelQueries({ queryKey: ['parts'] });
      
      // Sauvegarder l'état précédent
      const previousParts = queryClient.getQueryData<Part[]>(['parts']);
      
      // Supprimer optimiste
      queryClient.setQueryData<Part[]>(['parts'], (oldData = []) => {
        return oldData.filter(part => part.id !== partId);
      });
      
      return { previousParts };
    },
    onSuccess: (_, partId) => {
      console.log('✅ Suppression réussie de la pièce:', partId);
      
      // Supprimer la pièce du cache
      queryClient.removeQueries({ queryKey: ['parts', partId] });
      // Invalider la liste pour la rafraîchir
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée de l'inventaire.",
      });
    },
    onError: (error: any, partId, context) => {
      console.error('❌ Échec de la suppression:', error);
      
      // Restaurer l'état précédent
      if (context?.previousParts) {
        queryClient.setQueryData(['parts'], context.previousParts);
      }
      
      // Message d'erreur spécifique
      let errorMessage = "Impossible de supprimer la pièce";
      
      if (error.code === '23503') {
        errorMessage = "Cette pièce est référencée par d'autres éléments et ne peut pas être supprimée.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
