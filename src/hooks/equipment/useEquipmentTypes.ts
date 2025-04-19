
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEquipmentTypes, createEquipmentType, type EquipmentType } from '@/services/supabase/equipment/types';

export function useEquipmentTypes() {
  const queryClient = useQueryClient();

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: getEquipmentTypes
  });

  const createMutation = useMutation({
    mutationFn: createEquipmentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-types'] });
    }
  });

  return {
    types,
    isLoading,
    createType: createMutation.mutate
  };
}
