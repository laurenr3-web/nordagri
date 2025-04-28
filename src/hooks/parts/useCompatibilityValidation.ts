
import { useValidateCompatibility } from "@/hooks/equipment/useEquipments";
import { toast } from "sonner";

interface CompatibilityValidationOptions {
  onValidationError?: () => void;
}

export function useCompatibilityValidation(options?: CompatibilityValidationOptions) {
  const { data: validEquipmentIds } = useValidateCompatibility();
  
  const validateCompatibility = async (compatibilityIds: number[]): Promise<boolean> => {
    if (!compatibilityIds || compatibilityIds.length === 0) {
      return true; // Empty array is valid
    }
    
    // If we don't have validation data yet, assume valid
    if (!validEquipmentIds) {
      console.log('No validation data available, skipping validation');
      return true;
    }
    
    // Find any IDs that aren't in our valid set
    const invalidIds = compatibilityIds.filter(id => !validEquipmentIds.has(id));
    
    if (invalidIds.length > 0) {
      console.error('Invalid equipment IDs detected:', invalidIds);
      toast.error(`Certains équipements sélectionnés (${invalidIds.join(', ')}) n'existent pas ou ne sont plus disponibles.`);
      
      if (options?.onValidationError) {
        options.onValidationError();
      }
      
      return false;
    }
    
    return true;
  };
  
  const cleanInvalidIds = (compatibilityIds: number[]): number[] => {
    if (!validEquipmentIds || !compatibilityIds) {
      return compatibilityIds || [];
    }
    
    return compatibilityIds.filter(id => validEquipmentIds.has(id));
  };
  
  return {
    validateCompatibility,
    cleanInvalidIds
  };
}
