
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPart } from '@/services/supabase/parts/addPartService';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Vérifier que Supabase est bien connecté
      if (!supabase) {
        throw new Error("Client Supabase non initialisé");
      }
      
      // Ajouter une vérification des champs obligatoires
      if (!newPart.name || !newPart.partNumber) {
        throw new Error("Le nom et le numéro de pièce sont obligatoires");
      }
      
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
