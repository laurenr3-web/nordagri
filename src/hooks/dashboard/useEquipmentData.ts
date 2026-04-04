
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentItem } from './types/equipmentTypes';
import { validateEquipmentStatus } from '@/utils/typeGuards';

export const useEquipmentData = (user: any) => {
  const { data: equipmentData = [], isLoading: loading, refetch: fetchEquipment } = useQuery({
    queryKey: ['dashboard', 'equipment', user?.id],
    queryFn: async (): Promise<EquipmentItem[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || [])
        .filter(item => item?.id && item?.name)
        .map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'Unknown',
          image: item.image || '/placeholder.svg',
          status: validateEquipmentStatus(item.status),
          usage: { hours: 0, target: 500 },
          nextService: { type: 'Maintenance', due: '-' },
          nextMaintenance: '-',
        }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { loading, equipmentData, fetchEquipment };
};

export type { EquipmentItem } from './types/equipmentTypes';
