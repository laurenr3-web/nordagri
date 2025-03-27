
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService, Equipment } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';
import { isDataUrl, dataUrlToFile } from '@/services/supabase/equipment/utils';

/**
 * Hook for adding new equipment items
 * @returns Mutation object for adding equipment
 */
export const useAddEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newEquipment: Omit<Equipment, 'id'>) => {
      console.log('Tentative d\'ajout d\'équipement:', newEquipment);
      
      // Check if image is a data URL from camera capture
      let imageFile: File | undefined;
      if (newEquipment.image && isDataUrl(newEquipment.image)) {
        // Convert data URL to File
        console.log('Converting data URL to File');
        imageFile = dataUrlToFile(
          newEquipment.image, 
          `equipment-${Date.now()}.jpg`
        );
        // Clear the image URL since we're uploading a file
        newEquipment.image = undefined;
      }
      
      // Make sure serialNumber is properly handled
      if (newEquipment.serialNumber === '') {
        console.log('Serial number is empty, setting to null');
        newEquipment.serialNumber = null;
      }
      
      return equipmentService.addEquipment(newEquipment, imageFile);
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
