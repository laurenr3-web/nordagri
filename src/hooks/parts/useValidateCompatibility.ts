
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour valider la compatibilité des équipements sélectionnés
 */
export function useValidateCompatibility() {
  const { toast } = useToast();

  /**
   * Vérifie que tous les IDs d'équipements existent dans la base de données
   * @param equipmentIds Liste des IDs d'équipements à valider
   * @returns true si tous les équipements sont valides, false sinon
   */
  const validateEquipmentIds = useCallback(async (equipmentIds: number[]): Promise<boolean> => {
    if (!equipmentIds || equipmentIds.length === 0) {
      return true; // Si pas d'équipements sélectionnés, c'est valide
    }

    try {
      // Récupérer tous les IDs d'équipements existants qui correspondent aux IDs sélectionnés
      const { data, error } = await supabase
        .from('equipment')
        .select('id')
        .in('id', equipmentIds);

      if (error) {
        console.error('Erreur lors de la validation des équipements:', error);
        toast({
          title: "Erreur de validation",
          description: "Impossible de vérifier les équipements compatibles",
          variant: "destructive",
        });
        return false;
      }

      // Vérifier que tous les IDs sélectionnés existent dans la base de données
      const foundIds = data.map(item => item.id);
      const invalidIds = equipmentIds.filter(id => !foundIds.includes(id));

      if (invalidIds.length > 0) {
        toast({
          title: "Équipements invalides",
          description: `Certains équipements sélectionnés n'existent plus (IDs: ${invalidIds.join(', ')})`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation des équipements:', error);
      toast({
        title: "Erreur de validation",
        description: "Une erreur est survenue lors de la validation des équipements",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return { validateEquipmentIds };
}
