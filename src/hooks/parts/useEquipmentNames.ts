
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEquipmentNames = (equipmentIds: number[]) => {
  return useQuery({
    queryKey: ['equipment-names', equipmentIds],
    queryFn: async (): Promise<Map<number, string>> => {
      if (!equipmentIds.length) return new Map();
      
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name')
          .in('id', equipmentIds);
        
        if (error) throw error;
        
        const equipmentMap = new Map<number, string>();
        (data || []).forEach(item => {
          equipmentMap.set(item.id, item.name || `Équipement #${item.id}`);
        });
        return equipmentMap;
      } catch (err) {
        console.error('Erreur lors du chargement des noms d\'équipement:', err);
        return new Map();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
