
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePart } from '@/services/supabase/parts/deletePart';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personnalisé pour gérer la suppression des pièces avec React Query
 * et la notification par toast
 * 
 * @returns Un objet mutation pour gérer la suppression des pièces
 */
export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (partId: number | string) => deletePart(partId),
    
    onMutate: async (partId) => {
      console.log('⏳ Préparation de la suppression pour la pièce:', partId);
      
      // Annuler toutes les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['parts'] });
      
      // Prendre un instantané des données actuelles pour le rollback en cas d'erreur
      const previousParts = queryClient.getQueryData(['parts']);
      
      // Mise à jour optimiste: suppression immédiate dans l'UI
      queryClient.setQueryData(['parts'], (oldParts: any[] = []) => {
        return oldParts.filter(part => part.id !== partId);
      });
      
      return { previousParts };
    },
    
    onSuccess: () => {
      console.log('✅ Suppression réussie, invalidation des requêtes');
      
      // Invalidation du cache pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      // Afficher une confirmation du succès
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée avec succès.",
      });
    },
    
    onError: (error: any, partId, context) => {
      console.error('❌ Échec de la suppression:', error);
      
      // Annuler la mise à jour optimiste et restaurer les données précédentes
      if (context?.previousParts) {
        queryClient.setQueryData(['parts'], context.previousParts);
      }
      
      // Déterminer le message d'erreur approprié
      let errorMessage = error?.message || "Échec lors de la suppression de la pièce";
      let errorTitle = "Erreur de suppression";
      
      if (errorMessage.includes("référencée par d'autres éléments")) {
        errorTitle = "Suppression impossible";
        errorMessage = "Cette pièce est utilisée par d'autres éléments et ne peut pas être supprimée.";
      } else if (errorMessage.includes("Permissions insuffisantes")) {
        errorTitle = "Accès refusé";
      } else if (errorMessage.includes("Aucune pièce trouvée")) {
        errorTitle = "Pièce introuvable";
      }
      
      // Afficher l'erreur avec un toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
    
    onSettled: () => {
      console.log('🏁 Opération de suppression terminée');
      
      // S'assurer que les données sont à jour après la suppression
      queryClient.refetchQueries({ queryKey: ['parts'] });
    }
  });
}

// Export par défaut pour compatibilité
export default useDeletePart;
