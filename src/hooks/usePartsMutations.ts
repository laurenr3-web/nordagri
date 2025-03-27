
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPart, updatePart, deletePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';

/**
 * Hook pour créer une nouvelle pièce avec les mutations React Query
 * Fournit des notifications toast appropriées et l'invalidation du cache
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
      const errorMessage = error.message || "Impossible d'ajouter la pièce";
      console.error('Erreur lors de l'ajout de pièce:', errorMessage);
      
      toast({
        title: "Erreur d'ajout",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook pour mettre à jour une pièce existante avec les mutations React Query
 * Fournit des notifications toast appropriées et l'invalidation du cache
 */
export function useUpdatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: updatePart,
    onMutate: async (updatedPart) => {
      console.log('⏳ Démarrage de la mutation de mise à jour pour la pièce:', updatedPart);
      
      // Annuler toutes les requêtes de récupération sortantes
      await queryClient.cancelQueries({ queryKey: ['parts'] });
      
      // Prendre un instantané de la valeur précédente
      const previousParts = queryClient.getQueryData(['parts']);
      
      // Mettre à jour le cache de manière optimiste
      if (updatedPart.id) {
        queryClient.setQueryData(['parts'], (oldData: Part[] | undefined) => {
          if (!oldData) return [updatedPart];
          return oldData.map(part => 
            part.id === updatedPart.id ? updatedPart : part
          );
        });
      }
      
      return { previousParts };
    },
    onSuccess: (updatedPart) => {
      console.log('✅ Mise à jour réussie:', updatedPart);
      
      // Invalider les queries pour forcer un rafraîchissement
      queryClient.invalidateQueries({ 
        queryKey: ['parts']
      });
      
      // Afficher une notification de succès
      toast({
        title: "Pièce mise à jour",
        description: `${updatedPart.name} a été mise à jour avec succès.`,
      });
    },
    onError: (error: any, variables, context) => {
      console.error('❌ Échec de la mise à jour:', error);
      
      // Annuler la mise à jour optimiste
      if (context?.previousParts) {
        queryClient.setQueryData(['parts'], context.previousParts);
      }
      
      // Déterminer un message d'erreur plus précis
      let errorMessage = "Impossible de mettre à jour la pièce";
      
      if (error.code === '23505') {
        errorMessage = "Cette référence de pièce existe déjà.";
      } else if (error.code === '23502') {
        errorMessage = "Des champs obligatoires sont manquants.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Afficher une notification d'erreur détaillée
      toast({
        title: "Erreur de modification",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('🏁 Mutation de mise à jour terminée');
      // Refetch pour s'assurer que les données sont à jour
      queryClient.refetchQueries({ queryKey: ['parts'] });
    }
  });
}

/**
 * Hook pour supprimer une pièce avec les mutations React Query
 * Fournit des notifications toast appropriées et l'invalidation du cache
 */
export function useDeletePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: deletePart,
    onSuccess: (_, partId) => {
      // Supprimer la pièce du cache
      queryClient.removeQueries({ queryKey: ['parts', partId] });
      // Invalider la liste pour la rafraîchir
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée de l'inventaire.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Impossible de supprimer la pièce";
      console.error('Erreur lors de la suppression:', errorMessage);
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
