
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { addPart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';

export function useCreatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => {
      return addPart(part);
    },
    onSuccess: (newPart) => {
      // Invalidate and refetch parts query
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce ajoutée",
        description: `La pièce "${newPart.name}" a été ajoutée avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la pièce",
        variant: "destructive",
      });
    }
  });

  return mutation;
}
