
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPart, updatePart, deletePart } from '@/services/supabase/parts'; // Corrected import path
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
    mutationFn: (newPart: Omit<Part, 'id'>) => {
      console.log('📝 Tentative de création de pièce:', newPart);
      return addPart(newPart);
    },
    onSuccess: (data: Part) => {
      console.log('✅ Pièce créée avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast({
        title: "Pièce ajoutée",
        description: `${data.name} a été ajoutée à l'inventaire.`,
      });
    },
    onError: (error: any) => {
      // Analyse détaillée des erreurs
      let errorMessage = "Impossible d'ajouter la pièce";
      
      if (error.code === '23505') {
        errorMessage = "Cette référence de pièce existe déjà.";
      } else if (error.code === '23502') {
        errorMessage = "Des champs obligatoires sont manquants.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error("❌ Erreur lors de l'ajout de pièce:", errorMessage, error);
      
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
    mutationFn: (updatedPart: Part) => {
      console.log('📝 Tentative de mise à jour:', updatedPart);
      if (!updatedPart.id) {
        throw new Error("ID de pièce requis pour la mise à jour");
      }
      return updatePart(updatedPart);
    },
    onMutate: async (updatedPart: Part) => {
      console.log('⏳ Préparation de la mise à jour optimiste pour la pièce:', updatedPart.id);
      
      // Vérifier que l'ID est valide
      if (!updatedPart.id) {
        console.error('❌ Tentative de mise à jour sans ID');
        return { previousParts: null };
      }
      
      // Annuler toutes les requêtes de récupération sortantes
      await queryClient.cancelQueries({ queryKey: ['parts'] });
      
      // Prendre un instantané de la valeur précédente
      const previousParts = queryClient.getQueryData<Part[]>(['parts']);
      
      // Mettre à jour le cache de manière optimiste
      try {
        queryClient.setQueryData<Part[]>(['parts'], (oldData = []) => {
          return oldData.map(part => 
            part.id === updatedPart.id ? updatedPart : part
          );
        });
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour optimiste:', error);
      }
      
      return { previousParts };
    },
    onSuccess: (updatedPart: Part) => {
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
      
      // Annuler la mise à jour optimiste seulement si nous avons des données précédentes
      if (context?.previousParts) {
        queryClient.setQueryData(['parts'], context.previousParts);
      }
      
      // Analyse détaillée des erreurs
      let errorMessage = "Impossible de mettre à jour la pièce";
      
      if (error.code === '23505') {
        errorMessage = "Cette référence de pièce existe déjà.";
      } else if (error.code === '23502') {
        errorMessage = "Des champs obligatoires sont manquants.";
      } else if (error.code === '42703') {
        errorMessage = "Structure de données incorrecte. Contactez l'administrateur.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de modification",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('🏁 Finalisation de la mise à jour');
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
