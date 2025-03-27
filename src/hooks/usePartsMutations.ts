
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPart, updatePart, deletePart } from '@/services/supabase/partsService';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';

/**
 * Hook for creating a new part with React Query mutations
 * Provides proper toast notifications and cache invalidation
 */
export function useCreatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: addPart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast({
        title: "Pièce ajoutée",
        description: `${data.name} a été ajoutée à l'inventaire.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la pièce",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating an existing part with React Query mutations
 * Provides proper toast notifications and cache invalidation
 */
export function useUpdatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: updatePart,
    onMutate: async (updatedPart) => {
      console.log('⏳ onMutate with:', updatedPart);
      
      // Cancel any outgoing refetches to avoid them overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['parts'] });
      
      // Snapshot the previous value
      const previousParts = queryClient.getQueryData(['parts']);
      
      // Return a rollback context
      return { previousParts };
    },
    onSuccess: (data) => {
      console.log('✅ onSuccess with:', data);
      
      // Invalidate and refetch to ensure data consistency
      queryClient.refetchQueries({ queryKey: ['parts'], type: 'all' });
      
      // If we have the individual part query, also refetch that
      if (data.id) {
        queryClient.refetchQueries({ queryKey: ['parts', data.id], type: 'all' });
      }
      
      console.log('🔄 Complete refetch for ["parts"]');
      
      toast({
        title: "Pièce mise à jour",
        description: `${data.name} a été mise à jour avec succès.`,
      });
    },
    onError: (error: any, _variables, context) => {
      console.error('❌ onError:', error);
      
      // Roll back to the previous value on error
      if (context?.previousParts) {
        queryClient.setQueryData(['parts'], context.previousParts);
      }
      
      toast({
        title: "Erreur de modification",
        description: error.message || "Impossible de mettre à jour la pièce",
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('🏁 onSettled called - mutation complete');
    },
  });
}

/**
 * Hook for deleting a part with React Query mutations
 * Provides proper toast notifications and cache invalidation
 */
export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: deletePart,
    onSuccess: (_, partId) => {
      // Remove the deleted part from the cache
      queryClient.removeQueries({ queryKey: ['parts', partId] });
      // Invalidate the parts list to refresh it
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée de l'inventaire.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer la pièce",
        variant: "destructive",
      });
    },
  });
}
