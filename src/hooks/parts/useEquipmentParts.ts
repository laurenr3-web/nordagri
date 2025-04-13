
import { useQuery } from '@tanstack/react-query';
import { getPartsByEquipmentId } from '@/services/supabase/parts';
import { Part } from '@/types/Part';

export function useEquipmentParts(equipmentId: string | number | undefined) {
  return useQuery({
    queryKey: ['equipment-parts', equipmentId],
    queryFn: async () => {
      if (!equipmentId) return [];
      return getPartsByEquipmentId(equipmentId);
    },
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
