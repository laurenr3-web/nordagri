
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { addPart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';

export function useCreatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Creating a mutation for part creation with proper error handling
  const mutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => {
      console.log('Creating part in useCreatePart hook:', part);
      return addPart(part);
    },
    onSuccess: (newPart) => {
      // Invalidate and refetch parts query
      console.log('Part created successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce ajoutée",
        description: `La pièce "${newPart.name}" a été ajoutée avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Error in useCreatePart hook:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la pièce",
        variant: "destructive",
      });
    }
  });

  return mutation;
}
