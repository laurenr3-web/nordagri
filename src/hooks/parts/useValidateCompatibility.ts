
import { useState } from 'react';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';

export function useValidateCompatibility() {
  const [isValidating, setIsValidating] = useState(false);
  const { data: equipment } = useEquipmentList();

  const validateEquipmentIds = async (equipmentIds: string[]): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      if (!equipment || equipment.length === 0) {
        // If we can't check equipment, assume it's valid
        return true;
      }

      // Validate that all IDs exist in the equipment list
      const allValid = equipmentIds.every(id => {
        // Convert id to number for comparison
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;
        return equipment.some(eq => eq.id === numId);
      });
      
      return allValid;
    } catch (error) {
      console.error('Error validating equipment IDs:', error);
      // In case of error, return true to avoid blocking the user
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateEquipmentIds,
    isValidating
  };
}
