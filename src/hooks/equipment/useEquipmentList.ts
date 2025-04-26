
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Equipment {
  id: number;
  name: string;
}

export function useEquipmentList() {
  return useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      return data as Equipment[];
    }
  });
}
