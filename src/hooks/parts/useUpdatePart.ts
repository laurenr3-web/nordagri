
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { updatePart } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';

export function useUpdatePart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (part: Part) => {
      return updatePart(part);
    },
    onSuccess: (updatedPart) => {
      // Invalidate and refetch parts query
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Pièce mise à jour",
        description: `La pièce "${updatedPart.name}" a été mise à jour avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la pièce",
        variant: "destructive",
      });
    }
  });

  return mutation;
}
