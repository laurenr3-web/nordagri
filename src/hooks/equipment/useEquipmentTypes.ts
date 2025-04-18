
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEquipmentTypes, createEquipmentType, type EquipmentType } from '@/services/supabase/equipment/types';
import { toast } from 'sonner';

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
    },
    onError: (error: Error) => {
      console.error('Error creating equipment type:', error);
      toast.error('Erreur lors de la création du type d\'équipement');
    }
  });

  return {
    types,
    isLoading,
    createType: createMutation.mutate
  };
}
