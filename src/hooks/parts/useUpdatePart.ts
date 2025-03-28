
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';

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
      
      // Analyse détaillée des erreurs avec messages plus descriptifs
      let errorMessage = "Impossible de mettre à jour la pièce";
      let errorTitle = "Erreur de modification";
      
      if (error.code === '23505') {
        errorTitle = "Référence en double";
        errorMessage = "Cette référence de pièce existe déjà dans la base de données.";
      } else if (error.code === '23502') {
        errorTitle = "Champs obligatoires";
        errorMessage = "Des champs obligatoires sont manquants. Vérifiez tous les champs requis.";
      } else if (error.code === '42703') {
        errorTitle = "Erreur technique";
        errorMessage = "Structure de données incorrecte. Contactez l'administrateur.";
      } else if (error.code === '42501') {
        errorTitle = "Permissions insuffisantes";
        errorMessage = "Vous n'avez pas les droits nécessaires pour modifier cette pièce.";
      } else if (error.message) {
        // Extraire un message d'erreur plus concis et utile
        errorMessage = error.message;
        if (errorMessage.includes("L'ID de la pièce")) {
          errorTitle = "Erreur d'identifiant";
        } else if (errorMessage.includes("champ obligatoire")) {
          errorTitle = "Données incomplètes";
        } else if (errorMessage.includes("Référence de pièce en doublon")) {
          errorTitle = "Référence en double";
        }
      }
      
      toast({
        title: errorTitle,
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
