
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/services/supabase/equipment/types';

/**
 * Hook pour récupérer la liste des équipements disponibles
 */
export function useEquipmentList() {
  return useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, model, manufacturer, type')
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des équipements:', error);
        throw new Error(`Erreur de chargement des équipements: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
