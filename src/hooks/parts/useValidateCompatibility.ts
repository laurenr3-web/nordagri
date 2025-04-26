
import { useState } from 'react';
import { Equipment } from '../equipment/useEquipmentList';
import { useToast } from '@/hooks/use-toast';

export function useValidateCompatibility(equipment: Equipment[] | undefined) {
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);

  const validateCompatibility = async (equipmentIds: string[]) => {
    setValidating(true);
    try {
      if (!equipment) {
        throw new Error("La liste des équipements n'est pas disponible");
      }

      const validIds = new Set(equipment.map(e => e.id.toString()));
      const invalidIds = equipmentIds.filter(id => !validIds.has(id));

      if (invalidIds.length > 0) {
        console.error('Invalid equipment IDs:', invalidIds);
        toast({
          title: "Erreur de validation",
          description: "Certains équipements sélectionnés n'existent pas ou ont été supprimés",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating compatibility:', error);
      toast({
        title: "Erreur",
        description: "Impossible de valider la compatibilité des équipements",
        variant: "destructive",
      });
      return false;
    } finally {
      setValidating(false);
    }
  };

  return {
    validateCompatibility,
    validating
  };
}
