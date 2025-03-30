
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPart } from '@/services/supabase/parts/addPartService';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';
import { assertType } from '@/utils/typeAssertions';

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
      
      // Validation des propriétés critiques avant l'envoi
      assertType<string>(
        newPart.name, 
        (value): value is string => typeof value === 'string' && value.trim() !== '', 
        "Le nom de la pièce doit être une chaîne non vide"
      );
      
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
    onError: (error: Error) => {
      // Analyse détaillée des erreurs
      let errorMessage = "Impossible d'ajouter la pièce";
      
      const errorObj = error as Error & { 
        code?: string; 
        message: string 
      };
      
      if (errorObj.code === '23505') {
        errorMessage = "Cette référence de pièce existe déjà.";
      } else if (errorObj.code === '23502') {
        errorMessage = "Des champs obligatoires sont manquants.";
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
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
