
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService, Equipment } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';
import { isDataUrl, dataUrlToFile } from '@/services/supabase/equipment/utils';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Make sure serialNumber is properly handled (null, not empty string)
      if (newEquipment.serialNumber === '') {
        console.log('Serial number is empty, setting to null');
        newEquipment.serialNumber = null;
      }

      // Get the current user ID and add it to the equipment data
      if (!newEquipment.owner_id) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          newEquipment.owner_id = session.user.id;
          console.log('Setting owner_id to current user:', newEquipment.owner_id);
        }
      }
      
      // Create a clean copy of the equipment for debugging
      const cleanEquipment = { ...newEquipment };
      
      // Log the final equipment data being sent to the API
      console.log('Sending equipment data to API:', JSON.stringify(cleanEquipment, null, 2));
      
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
      // Add more detailed error logging to help debug the issue
      if (error.message) {
        console.error('Message d\'erreur:', error.message);
      }
      if (error.details) {
        console.error('Détails de l\'erreur:', error.details);
      }
      if (error.code) {
        console.error('Code d\'erreur:', error.code);
      }
      if (error.hint) {
        console.error('Suggestion:', error.hint);
      }
      
      toast.error(`Erreur: ${error.message || 'Impossible d\'ajouter l\'équipement'}`);
    }
  });
};
