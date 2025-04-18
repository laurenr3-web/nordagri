
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManufacturers, addManufacturer, Manufacturer } from '@/services/supabase/manufacturers';
import { useToast } from '@/hooks/use-toast';

export function useManufacturers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers,
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => addManufacturer(name),
    onSuccess: (newManufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast({
        title: "Fabricant ajouté",
        description: `Le fabricant "${newManufacturer.name}" a été ajouté avec succès.`
      });
    },
    onError: (error) => {
      console.error('Error adding manufacturer:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fabricant. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  return {
    manufacturers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addManufacturer: (name: string) => addMutation.mutateAsync(name),
    isAdding: addMutation.isPending
  };
}
