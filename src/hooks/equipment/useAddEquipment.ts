
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService, Equipment } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';

/**
 * Hook for adding new equipment items
 * @returns Mutation object for adding equipment
 */
export const useAddEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newEquipment: Omit<Equipment, 'id'>) => {
      console.log('Tentative d\'ajout d\'équipement:', newEquipment);
      return equipmentService.addEquipment(newEquipment);
    },
    onSuccess: (data) => {
      console.log('Équipement ajouté avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-filter-options'] });
      
      toast.success('Équipement ajouté avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'ajout d\'équipement:', error);
      toast.error(`Erreur: ${error.message || 'Impossible d\'ajouter l\'équipement'}`);
    }
  });
};
