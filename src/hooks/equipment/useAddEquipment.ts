
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';

export function useAddEquipment() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newEquipment: any) => {
      console.log('Adding new equipment:', newEquipment);
      return equipmentService.addEquipment(newEquipment);
    },
    onSuccess: (data) => {
      console.log('Equipment added successfully:', data);
      
      // Mettre à jour le cache des requêtes
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      
      toast.success('Équipement ajouté avec succès');
    },
    onError: (error: any) => {
      console.error('Error adding equipment:', error);
      toast.error('Erreur lors de l\'ajout de l\'équipement', {
        description: error.message
      });
    }
  });
  
  return mutation;
}
