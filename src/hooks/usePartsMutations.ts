import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPart, updatePart, deletePart } from '@/services/partsService';
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
    mutationFn: createPart,
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
    onMutate: (updatedPart) => {
      console.log('⏳ onMutate avec:', updatedPart);
      // Add optimistic update logic here if needed
    },
    onSuccess: (data) => {
      console.log('✅ onSuccess avec:', data);
      // Force a complete refetch instead of just invalidating
      queryClient.refetchQueries({ queryKey: ['parts'], type: 'all' });
      queryClient.refetchQueries({ queryKey: ['parts', data.id], type: 'all' });
      console.log('🔄 Refetch complet pour ["parts"]');
      
      toast({
        title: "Pièce mise à jour",
        description: `${data.name} a été mise à jour avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ onError:', error);
      toast({
        title: "Erreur de modification",
        description: error.message || "Impossible de mettre à jour la pièce",
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('🏁 onSettled appelé - fin de la mutation');
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
