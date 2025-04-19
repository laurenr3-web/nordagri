
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createEquipmentType } from '@/services/supabase/equipment/types';
import { toast } from 'sonner';

export type EquipmentType = {
  id: string;
  name: string;
  farm_id: string | null;
  created_at: string;
  updated_at: string;
};

export function useEquipmentTypes() {
  const query = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Create new equipment type function wrapper
  const createType = async (name: string) => {
    try {
      const result = await createEquipmentType(name);
      // Invalidate query to refresh data
      query.refetch();
      return result;
    } catch (error) {
      console.error('Error creating equipment type:', error);
      toast.error("Erreur lors de la création du type d'équipement");
      throw error;
    }
  };

  return {
    ...query,
    types: query.data || [],
    createType
  };
}
