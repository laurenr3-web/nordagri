
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStorageLocations, addStorageLocation, StorageLocation } from '@/services/supabase/locations';
import { useToast } from '@/hooks/use-toast';

export function useStorageLocations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['storageLocations'],
    queryFn: getStorageLocations,
  });

  const addMutation = useMutation({
    mutationFn: (params: { name: string; description?: string }) => 
      addStorageLocation(params.name, params.description),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ['storageLocations'] });
      toast({
        title: "Emplacement ajouté",
        description: `L'emplacement "${newLocation.name}" a été ajouté avec succès.`
      });
    },
    onError: (error) => {
      console.error('Error adding storage location:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'emplacement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  return {
    locations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addLocation: (name: string, description?: string) => 
      addMutation.mutateAsync({ name, description }),
    isAdding: addMutation.isPending
  };
}
